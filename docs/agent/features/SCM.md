# SCM — Supply Chain Management and Traceability

**Status:** Draft — requirements consolidated; detailed owner validation required.
**Owner pillar:** SBI (corporate mapping; operational components may be assigned to
SPBA / SAMMEND). **Primary backend:** Odoo 18 CE (`syailendra_scm`).

## 1. Goal and scope

Manage supplier and origin master data, harvest capture, distillation, incoming raw
material, QC, compliance, production genealogy, shipment, public trace, and partner
submissions. SCM is the first module to complete because traceability depends on
stable master data and operational event capture.

### In scope

- Supplier type/category/status, supplier profile, farm, crop, and distillery
- Harvest sessions and biomass delivery records
- Distillation runs and output oil lots
- Raw-material receipt, discrepancy disposition, quarantine, QC, CoA/GC-MS data
- Supplier audit, score/evaluation, corrective actions
- Batch genealogy across production, finished goods, and shipment
- QR/GS1 labels, public trace, authenticated private trace
- Partner access/submission and object-storage media metadata

### Explicitly not assumed

- No separate biomass batch ID is required by current source process.
- The distiller does not perform a separate company-side QC/packaging stage; incoming
  company QC and later company packaging remain applicable.
- Odoo CE `quality_control` is not available; implement the QC gate with the project's
  custom model + stock locations.
- No GS1 prefix has been confirmed. Do not generate production GTINs until owner
  confirms the allocation.

## 2. Actors and duties

| Actor | Permissions (proposal; confirm with owner) |
| :--- | :--- |
| SCM operator | Create/edit draft suppliers, harvests, distillation, receipts |
| Field officer / agronomist | Capture farm, crop, harvest, farmer delivery evidence |
| Distiller operator | Record equipment, biomass input, run parameters, output |
| Warehouse receiver | Record scale weight, receipt docs, quarantine put-away |
| QC analyst | Record test result and recommend release/reject |
| QC manager | Approve release/reject; cannot silently alter the original result |
| Procurement | Supplier evaluation, PO reference, commercial data |
| SCM manager | Manage master data, audit/CAPA, permissions, reporting |
| Partner | Submit own data and files; cannot read another partner's data |
| Public visitor | Read only approved public trace projection |

## 3. End-to-end workflows

### 3.1 Supplier and source onboarding

1. Create/select supplier type and hierarchical category.
2. Register `res.partner` with legal identity, contacts, status, grade, and approved
   documents.
3. Register owned/managed farms, crops, location, GPS/elevation, and certification.
4. Register distillery, method, capacity, equipment, and baseline yield.
5. Approve supplier before procurement or partner portal access.

**Validation:** supplier identifiers are unique; legal docs and approval state are
visible; farm ownership and company scope are explicit.

### 3.2 Harvest and delivery to distillery

1. Create a harvest session linked to supplier/farm/crop.
2. Capture harvest date/time, location, plant part, biomass weight, operator, and
   optional photo/document evidence.
3. Capture received weight and discrepancy if delivered to a distillery.
4. Record reason and approver for variance beyond the approved threshold.

**Source rule:** no separate biomass batch ID is required; harvest session remains the
traceable source event.

### 3.3 Distillation

1. Start a distillation record linked to harvest session and distillery.
2. Record equipment/method, operator, input biomass quantity, start/end, and process
   parameters required by the approved SOP.
3. Record oil/hydrosol output, yield, and oil sample.
4. Create/associate a `stock.lot` output lot linked to the source harvest and run.
5. Capture supporting reports and exceptions as audit events.

**Acceptance:** cannot complete without input and output quantities, time, operator,
source reference, and a lot; yield is derived consistently and units are explicit.

### 3.4 Raw material receipt and QC

1. Receive supplier/distiller delivery against PO/shipment reference.
2. Record declared quantity, scale quantity, tare/gross/net, and evidence.
3. Create receipt and lot records; lot enters `WH/Input/Quarantine`.
4. Capture sample and QC physical/chemical/GC-MS observations with units and limits.
5. QC manager approves, rejects, or requests more data.
6. On release, route to `WH/Stock/Approved`; on reject, remain blocked pending disposition.

**Hard rules:** pending/rejected lots are not reservable or consumable. Never grant a
client UI permission that bypasses the Odoo gate.

### 3.5 Production, packing, and outbound trace

1. Production consumes only released lots and records source lot quantities.
2. New production/FG lot stores complete input genealogy.
3. Record packing run, package/label preset, output quantity, and label IDs.
4. Delivery links customer/order, finished lot, carrier, and tracking number.
5. Generate QR containing the public trace URL and GS1 identifier, subject to Q-01.
6. Public route exposes only approved data; private roles may access richer evidence.

## 4. Core business rules

| ID | Rule |
| :--- | :--- |
| SCM-BR-01 | Every harvest, distillation, receipt, QC, production, packing, and shipment event links to its source/next event. |
| SCM-BR-02 | A lot in pending or rejected QC state cannot be reserved or consumed. |
| SCM-BR-03 | All received oil begins in quarantine until authorized release. |
| SCM-BR-04 | Declared and actual weights remain separately stored; variance and approvals are auditable. |
| SCM-BR-05 | Genealogy is many-to-many: every output lot records all input lot IDs and consumed quantities. |
| SCM-BR-06 | No destructive deletion of events/lineage; corrections append history or use approved cancellation/reversal. |
| SCM-BR-07 | Cross-company reads and writes require explicit allowed-company context and record-rule authorization. |
| SCM-BR-08 | Public trace excludes supplier/employee PII, buyer pricing, private documents, and internal findings. |
| SCM-BR-09 | QC results retain method, units, limits, analyst, time, source attachment/checksum, and reviewer. |
| SCM-BR-10 | User-facing labels and validation messages support both `id` and `en`. |
| SCM-BR-11 | A supplier cannot access another supplier's farm, submission, shipment, or media. |
| SCM-BR-12 | QR label IDs and payload URLs are unique, revocable, and auditable. |

## 5. Data contract (logical)

```text
Supplier (res.partner)
  ├── SupplierType / SupplierCategory / SupplierEvaluation / SupplierAudit
  ├── Farm ── Crop
  ├── Distillery
  └── Harvest ── Distillation ── StockLot
                                ├── Receipt / QCInspection / Media
                                └── Production ── FinishedLot ── Shipment
                                                          └── QRLabel ── PublicTrace
```

All records include applicable company, active/archive status, created/updated user
and timestamp. Binary bytes remain in object storage; Odoo stores metadata/object key,
checksum, content type, size, and access policy.

## 6. Current implementation map

| Capability | Current state |
| :--- | :--- |
| Supplier/category/type master and evaluation models | Addon models exist; check exact RPC/UI completeness before implementation |
| Farm/crop/distillery models | Addon models exist; live farms = 0, distilleries = 6, suppliers = 305 at snapshot |
| Harvest, distillation, QC UI pages | Frontend routes are currently stubs / limited shells |
| Raw-material receipt + QR label model | In repo under addon `18.0.1.7.0`; not live (deployed version `18.0.1.6.0`) |
| Public trace page | `/trace/[lot_code]` and service exist |
| Stock lot lineage | Model extension exists; live snapshot 23 lots with no populated lineage |
| Partner portal | Model scaffolding exists; no live access/submission/media records at snapshot |
| S3 media | Service/UI work exists; verify deployment/config before assuming production availability |

## 7. Acceptance criteria

- Supplier, farm, crop, and distillery records can be created, reviewed, searched, and
  archived with company security and complete translations.
- Harvest and distillation transitions validate required evidence and calculate yield
  from compatible units.
- Receipt variance beyond the configured threshold requires a reason and approval.
- Pending/rejected QC lots are blocked in backend reservation/consumption, not just UI.
- Released lots can be used in production; output lot genealogy is complete and
  traversable in both directions.
- Audit history survives correction/cancellation.
- Public trace displays approved origin, batch, quality summary, and shipment status
  without exposing private fields.
- QR label PDF contains both public URL and approved GS1 identifier and renders at
  the chosen physical print size.
- Partner portal enforces per-partner ownership and safe upload constraints.

## 8. Metrics and reports (proposed)

| Metric | Definition |
| :--- | :--- |
| Trace completeness | % active lots with full required lineage |
| QC hold rate | Lots pending or rejected / lots received |
| QC turnaround | Time from sample creation to final decision |
| Weight variance | (scale net − declared quantity) / declared quantity |
| Distillation yield | oil output / biomass input, normalized by units |
| Supplier quality grade | Approved weighted score from evaluation dimensions |
| CAPA overdue | Open corrective actions past due date |

## 9. Open decisions

- Confirm tolerance and approver for weight discrepancies.
- Confirm GS1 prefix, GTIN/SSCC policy, and QR payload syntax.
- Confirm target QC specifications per botanical/plant part/product.
- Confirm product/production/packing responsibility and whether Odoo Manufacturing is
  used or custom production models are preferred.
- Confirm final actor permissions and separation of duty.
- Confirm media retention, consent, and public trace data fields.
- Approve 1.7.0 deployment as a separate release decision; this spec is not approval.
