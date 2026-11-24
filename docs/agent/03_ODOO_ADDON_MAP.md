# 03 — Odoo Addon Map

Addons live in `addons/` inside the repository and are deployed to the Odoo host.
Version numbers follow Odoo conventions: `18.0.<major>.<minor>.<patch>`.

## Addon inventory

| Addon | Version in repo | Deployed | Purpose |
| :--- | :--- | :--- | :--- |
| `syailendra_scm` | `18.0.1.7.0` | `18.0.1.6.0` | SCM, traceability, quality, compliance, portal |
| `syailendra_region` | see `__manifest__.py` | deployed | Indonesian regional master data |

> **Status note:** the repository working tree carries an uncommitted step from
> `18.0.1.6.0` to `18.0.1.7.0` (raw material receipt, QR label registry, label
> reports, trace token backfill, traceability chain tests). Those models exist in
> the code but are **not deployed** to production until the addon upgrade is
> executed. Treat them as "in repo, not live" in every plan and report.

## Model map

| Domain folder | Model | Notes |
| :--- | :--- | :--- |
| `master/` | `syailendra.crop` | Botanical species, plant part, cultivation status |
| `master/` | `syailendra.farm` | Plot, terroir, GPS, elevation, area |
| `master/` | `syailendra.distillery` | Facility, method, capacity, yield baseline |
| `master/` | `syailendra.supplier.type` | Managed supplier type master, code `ST-####` |
| `master/` | `syailendra.media` | Media and document rows (object storage keys, checksum) |
| `operation/` | `syailendra.harvest` | Harvest session with delivery and cancel transitions |
| `operation/` | `syailendra.distillation` | Distillation batch; lot issuance and state transitions |
| `operation/` | `syailendra.rm.receipt` | Raw material receipt with document vs weighed quantity |
| `quality/` | `syailendra.qc.inspection` | Physical, chemical, and GC-MS results; quarantine transitions |
| `stock/` | `stock.lot` (extended) | Lineage fields, quarantine state, CoA, lab properties |
| `stock/` | `stock.move.line` (extended) | Quarantine gate on receipt |
| `partner/` | `res.partner` (extended) | Supplier type, status, grade, legality, ESG fields |
| `partner/` | `res.partner.category` (extended) | Supplier category hierarchy |
| `compliance/` | `syailendra.supplier.audit` | Field audit, findings, CAPA, next audit date |
| `compliance/` | `syailendra.supplier.evaluation` | Weighted performance score and grade A–D |
| `traceability/` | `syailendra.qr.label` | QR label print registry (lot, preset, payload URL) |
| `portal/` | `syailendra.partner.access` | Partner portal credential and status |
| `portal/` | `syailendra.partner.submission` | Partner submissions awaiting review |
| `portal/` | `syailendra.distiller.shipment` | Oil shipment from distiller to the company |
| `portal/` | `syailendra.portal.access.log` | Portal access audit trail |
| `product/` | `product.template` (extended) | Aromatic product metadata and QC release flag |

## Security model

| Group | Purpose |
| :--- | :--- |
| `group_scm_user` | Operational create, read, write; no unlink |
| `group_scm_manager` | Full access including unlink |
| `group_qc_analyst` | QC inspection entry |
| `group_qc_manager` | QC release authority |
| `group_scm_api` | Integration account: read-only unless explicitly raised |

Record rules restrict SCM data per company unless `company_id` is empty, so every
RPC must declare the allowed companies.

## Sequences

Sequences are defined in `data/ir_sequence_data.xml` and cover harvest,
distillation, QC inspection, supplier type, supplier code, partner submission,
distiller shipment, raw material receipt, QR label, supplier audit, and supplier
evaluation.

## Extension rules

1. Never edit a deployed addon in place; change the repo copy and deploy that.
2. Bump the version and, when data changes are required, add a migration under
   `migrations/<version>/`.
3. Keep Python in English with Odoo coding guidelines; user-facing strings stay
   translatable.
4. Add ACL rows for every new model in `security/ir.model.access.csv`.
5. Record rules for company scoping must follow the existing pattern.
