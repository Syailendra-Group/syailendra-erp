# 07 — Data Backlog and Readiness

Status is a snapshot, not a substitute for a fresh authorized query.

| Dataset / capability | Snapshot | Implication | Next requirement |
| :--- | :---: | :--- | :--- |
| Suppliers | 305 | Master data exists | Validate types/categories, legal docs, duplicate policy |
| Farms | 0 | Harvest cannot be operationally linked to farms | Determine source and create approved farm records |
| Distilleries | 6 | Facilities exist | Validate location, method, capacity, ownership |
| Harvest sessions | 0 | No field-operation history | Design capture and pilot real harvest flow |
| Distillation batches | 0 | No batch output genealogy | Define operator, equipment, input/output capture |
| QC inspections | 0 | QC gate may not have operational evidence | Configure tests/specs, role and release policy |
| Stock lots | 23, no lineage | Traceable lot structure not populated | Map existing lots and populate lineage under migration plan |
| Partner access / submissions / media | 0 / 0 / 0 | Partner portal not live | Define onboarding, consent, storage, review operations |

## Data stewardship questions

- Who approves supplier/farm/distillery master data and handles deactivation?
- Which source is authoritative for botanical names and plant-part taxonomy?
- What is the allowed tolerance for declared-vs-scale weight discrepancies?
- Which party owns product specs, acceptance limits, and CoA approval?
- What fields may be shown in public traceability?
