# WMS — Warehouse and Production Management

**Status:** Skeleton — structure and verified route inventory recorded; business
requirements not yet mapped with the owner. Do not treat the "Planned scope" section as
approved requirements.

**Primary entity:** SPBA (distillation, warehouse, inventory)

## 1. Purpose

Manage receiving, quarantine, put-away, internal moves, production/blending, packaging, and dispatch. This pillar carries the stock consequences of SCM traceability.

## 2. Route inventory (verified 2026-11-23)

| Route | Notes |
| :--- | :--- |
| `(dashboard)/inventory` | |
| `(dashboard)/wms` | |

## 3. Current state

Only landing routes exist today (`/inventory`, `/wms`); `src/features/wms/` exists. The operational implementation lives today inside the SCM addon (warehouse routing `WH/Input/Quarantine` → `WH/Stock/Approved`). Confirm with the owner whether WMS remains a UI grouping over SCM models or becomes a separate addon.

## 4. Planned scope (to be validated)

- Receipt, quarantine, quality hold and approved-stock locations.
- Internal transfers, stock counts, and adjustments with approval.
- Production/blending orders with input-lot consumption records.
- Packaging runs, label assignment, and dispatch preparation.
- Stock ledger and valuation reporting.

## 5. Dependencies

- SCM lot lineage and QC release state (hard dependency: no consumption of unreleased lots).
- Decision on using standard Odoo Manufacturing vs a custom production model.
- Warehouse layout master data for the company's sites.

## 6. Open questions

- Separate addon or SCM sub-module?
- Which warehouse operations are executed on handheld devices, and does that require offline support?
- Is stock valuation in scope (Finance) or only quantity tracking?
