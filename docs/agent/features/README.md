# Feature Specifications

One document per business pillar. SCM is the first fully specified pillar; the rest are
verified skeletons (route inventory + current state + scope to be validated with the
owner).

| Document | Status | Route root(s) |
| :--- | :--- | :--- |
| `SCM.md` | Draft — full specification | `/scm` (38 routes) |
| `MITRA.md` | Skeleton — most developed non-SCM surface, not in operational use | `/mitra` (18 routes) |
| `OTHERS.md` | Skeleton — populated admin and regional master data | `/others`, `/admin`, `/settings` (21 routes) |
| `HRM.md` | Skeleton | `/hris`, `/hr`, `/employees` |
| `WMS.md` | Skeleton | `/inventory`, `/wms` |
| `CRM.md` | Skeleton | `/crm` |
| `DCM.md` | Skeleton | `/dcm` |
| `FTM.md` | Skeleton | `/ftm` |
| `IMM.md` | Skeleton | `/imm` |
| `AI.md` | Skeleton | `/ai` |
| `AUTH.md` | Skeleton | `/[locale]/login`, `/mitra/login` |

## How to complete a skeleton

1. Walk the route inventory with the owner and record the real business purpose of each
   screen, or delete the screen from the plan.
2. Convert each "Planned scope" bullet into a requirement with an owner, a data
   contract, and acceptance criteria.
3. Resolve the "Open questions" list; move anything unresolved into
   `docs/agent/10_OPEN_QUESTIONS.md`.
4. Keep the document in English and keep tables machine-readable.
