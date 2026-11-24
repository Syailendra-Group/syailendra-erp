# 02 — Domain Glossary

## Batch lineage

The supply chain is modelled as seven ordered layers. Each layer is a node that can
be traced backwards and forwards.

| Step | Code | Meaning |
| :--- | :--- | :--- |
| 1 | `FMR` | Farmer or supplier profile (now a supplier type, not a separate master) |
| 2 | `HAR` | Field harvest session |
| 3 | `DSTB` | Distillation batch |
| 4 | `RM` | Raw material batch received and released at the warehouse |
| 5 | `PROD` | Production or blending batch |
| 6 | `FG` | Finished goods batch |
| 7 | `SHIP` | Shipment to customer |

## Core concepts that must not be mixed

| Concept | Model | Meaning |
| :--- | :--- | :--- |
| Supplier type | `syailendra.supplier.type` | Actor type: farmer, distiller, collector, cooperative, farmer group, SME, company |
| Supplier category | `res.partner.category` | Procurement grouping, hierarchical (01 raw material, 02 packaging, ...) |
| Supplier status | `res.partner.supplier_status` | Active, inactive, pending, blacklist |
| Farm | `syailendra.farm` | Plot and terroir owned by a supplier |
| Distillery | `syailendra.distillery` | Distillation facility with capacity and method |
| Crop | `syailendra.crop` | Botanical species and plant part |
| Lot | `stock.lot` (extended) | Traceability node carrying lineage, quarantine state, and lab data |

## Quality vocabulary

| Term | Meaning |
| :--- | :--- |
| Incoming QC | Inspection of received oil before it may be used |
| QC gate | A batch that fails QC cannot be selected as production material |
| Quarantine | Blocked state after receipt, before approval |
| CoA | Certificate of Analysis |
| GC-MS | Gas chromatography–mass spectrometry compound profile |
| Yield | Oil output divided by biomass input, expressed as a percentage |

## Units and conventions

| Item | Convention |
| :--- | :--- |
| Mass | Kilograms (`kg`), three decimals for weighing |
| Volume | Litres or millilitres for oil and hydrosol |
| Temperature | Celsius |
| Pressure | Bar or kPa, declared per record |
| Time zone | Asia/Jakarta (WIB, UTC+7) in UI; naive UTC for Odoo datetimes |
| Locale | Indonesian (`id`) and English (`en`), always symmetric |

## Identifier prefixes

| Prefix | Entity |
| :--- | :--- |
| `SUP-*` | Supplier reference |
| `HAR-*` | Harvest session |
| `DSTB-*` | Distillation batch |
| `RCP-*` | Raw material receipt |
| `SHP-*` | Distiller shipment to the company |
| `QRL-*` | QR label print record |
| `RM-*` | Released raw material lot |
| `PROD-*` | Production batch |
| `FG-*` | Finished goods batch |

## Packaging and sample vocabulary

| Item | Rule |
| :--- | :--- |
| Sample quota | Maximum three free variants per company or buyer |
| Sample sizes | Regular oils 5 ml, precious oils 1 ml |
| Finished goods sizes | 2 ml, 5 ml, 10 ml priority; 50 ml and 100 ml for fast-moving products |
| Bulk storage | Large drums, decanted into smaller containers as required |
| Label presets | Sample vial, retail bottle, raw material drum, warehouse pallet |
