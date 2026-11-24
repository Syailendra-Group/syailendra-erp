# 04 — Process and Data Requirements

This document consolidates the supplied PT SBI process-mapping, traceability,
warehouse-flow, scope-definition, sample-SOP, and production-traceability materials.
Requirements below are source-derived business rules; they do not assert that every
step is already implemented in the live ERP.

## Source-derived process

The business flow consists of twelve steps, with some parallel operational tracks:

| # | Process step | Required evidence / output |
| :-: | :--- | :--- |
| 1 | Maintain supplier, farmer, farm, crop, and distillery master data | Approved IDs, ownership, location, and legal/quality documents |
| 2 | Plan purchase and raw-material demand | Purchase reference (`PO_ID`), item, quantity, target date, buyer |
| 3 | Create harvest session | `HARVEST_ID`, supplier/farm, crop, harvest date/time, biomass weight |
| 4 | Receive biomass at distillery | Inbound weight, receiver, receipt timestamp, discrepancy evidence |
| 5 | Distill the biomass | `DISTILLATION_ID`, recipe/equipment, operator, start/end, output, yield |
| 6 | Record the oil batch and sample | `BATCH_ID`, botanical, plant part, batch volume/weight, sample ID |
| 7 | Submit sample for quality testing | `SAMPLE_ID`, chain of custody, analysis and lab result |
| 8 | Release or quarantine the lot | QC decision, reviewer, timestamp, reason; failed lot cannot be consumed |
| 9 | Receive and put away raw material | `RECEIPT_ID`, scale weight, lot, quarantine or approved location |
| 10 | Blend / produce finished goods | `PRODUCTION_ID`, input lots/quantities, formula, operator, output lot |
| 11 | Pack, label, and release finished goods | `PACKING_ID`, package, label payload, approval, finished-goods lot |
| 12 | Ship and expose public trace | `SHIPMENT_ID`, order/customer, carrier, `TRACKING_NUMBER`, trace URL |

## Identifier set from the process-mapping source

The following 13 identifiers are used by source spreadsheets/documents. Where the
current domain model uses a different technical field, maintain an explicit mapping.

| Business identifier | System mapping (candidate) | Required |
| :--- | :--- | :---: |
| `PO_ID` | `purchase.order.name` | Yes |
| `SUPPLIER_ID` | `res.partner.id` + `ref` | Yes |
| `FARM_ID` | `syailendra.farm.id` + code | Conditional |
| `HARVEST_ID` | `syailendra.harvest.name` | Yes |
| `BIOMASS_BATCH_ID` | Source calls this not needed as a separate ID | No separate ID |
| `DISTILLATION_ID` | `syailendra.distillation.name` | Yes |
| `BATCH_ID` | `stock.lot.name` / distillation output lot | Yes |
| `SAMPLE_ID` | `syailendra.qc.inspection` / lab sample reference | Yes |
| `RECEIPT_ID` | `syailendra.rm.receipt.name` or stock picking | Yes |
| `PRODUCTION_ID` | Odoo manufacturing / production reference | Yes |
| `PACKING_ID` | Odoo packaging / finished-goods reference | Yes |
| `SHIPMENT_ID` | Odoo delivery reference | Yes |
| `TRACKING_NUMBER` | Carrier tracking field on delivery | Conditional |

> The 13th identifier list varies between source documents; verify the canonical
> names against `TRACEABILITY` / mapping workbook before freezing Odoo contracts.

## Mandatory control rules

| Rule | Acceptance criterion |
| :--- | :--- |
| QC hard gate | A rejected or pending lot cannot be reserved or consumed for production. |
| Quarantine on receipt | Every new raw-oil lot enters quarantine until an authorized QC release. |
| Weight discrepancy | Capture both declared and scale weight; discrepancy above the approved tolerance requires a reason and supervisor disposition. |
| Batch genealogy | Every production/finished lot links to all input lots and quantities. |
| Audit trail | State changes and approvals record actor, timestamp, previous/new state, and reason where applicable. |
| No silent merge | Lot merge/blend preserves the full source-lot list and allocation quantities. |
| Public trace minimization | Public payload excludes personal, financial, commercial, and internal laboratory data. |
| Data integrity | Prevent duplicate active IDs and orphan lineage relations. |
| Separation of duty | Creator and final QC releaser are distinct users when the operation requires independent release. |

### Source exceptions that must remain visible

- Source materials mark **biomass batch number** as not required as a separate ID.
- Source materials mark a **QC / packaging step on the distiller's side** as not
  required. The receiving company still performs incoming QC and its own packaging
  controls where applicable.
- These exceptions do not remove the need for harvest, distillation, output lot,
  receipt, and incoming QC references.

## Warehouse locations and state flow

The deployed Odoo Community edition does not include the Enterprise `quality_control`
module. Quarantine is enforced through stock routes/locations and a custom QC model.

```
WH/Input/Quarantine ── authorized QC release ──> WH/Stock/Approved
          │
          └── reject / investigate ──> WH/Input/Quarantine (blocked; disposition pending)
```

A failed QC check must block downstream consumption. A custom quality inspection
(`syailendra.qc.inspection`) is the decision record; `stock.lot.lot_properties`
(JSONB) carries botanical and GC-MS lab observations where appropriate.

## Sample SOP rules

1. Create a sample request and link it to a unique lot/batch.
2. Record sample amount, container/seal, sampler, time, and custody transfer.
3. Retain the sample ID independently from the batch ID.
4. Record lab method, result, units, specification range, reviewer, and attachments.
5. Mark missing/invalid results as pending; do not treat them as a pass.
6. Preserve the original result; corrections append an audit event, not overwrite history.

## Label, QR, and public trace

- QR payload contains **both** the public trace URL and the applicable GS1 identifier.
- Label rendering uses a client-side PDF library; PDF generation must be tested in
  the target browser and must not disclose internal fields.
- Label presets cover sample vial, retail bottle, raw-material drum, and warehouse pallet.
- Public trace shows approved origin and chain data only; private trace requires an
  authenticated role.
- GS1 prefix/allocation is an owner decision and remains an open item until confirmed.

## Acceptance scenarios

- A QC-pending raw-material lot cannot be selected in a production form.
- Weight variance exceeding tolerance blocks receipt approval and records evidence.
- A finished-goods lot can be traversed backwards to every source lot, harvest,
  supplier/farm, and relevant distillation batch.
- A shipment links the finished-goods lot, customer/order, carrier, tracking number,
  and public trace QR.
- Corrections to QC, receipt weight, and lineage are auditable.
- Public trace cannot expose supplier PII, buyer pricing, internal findings, or
  unapproved lab attachments.
