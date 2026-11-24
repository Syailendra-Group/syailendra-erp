# OTHERS — Administration, Regional Master Data, and Website

**Status:** Skeleton — structure and verified route inventory recorded; business
requirements not yet mapped with the owner. Do not treat the "Planned scope" section as
approved requirements.

**Primary entity:** SG (administration)

## 1. Purpose

Administrative surfaces that support every pillar: company profile, roles, regional master data, navigation/menu administration, and the public website.

## 2. Route inventory (verified 2026-11-23)

| Route | Notes |
| :--- | :--- |
| `(dashboard)/others` | |
| `(dashboard)/others/audit` | |
| `(dashboard)/others/company` | |
| `(dashboard)/others/countries` | |
| `(dashboard)/others/provinces` | |
| `(dashboard)/others/regencies` | |
| `(dashboard)/others/districts` | |
| `(dashboard)/others/villages` | |
| `(dashboard)/others/docs` | |
| `(dashboard)/others/menus` | |
| `(dashboard)/others/partners` | |
| `(dashboard)/others/roles` | |
| `(dashboard)/others/website` | |
| `(dashboard)/admin` | |
| `(dashboard)/admin/company` | |
| `(dashboard)/admin/contacts` | |
| `(dashboard)/admin/departments` | |
| `(dashboard)/admin/employees` | |
| `(dashboard)/admin/roles` | |
| `(dashboard)/settings` | |

## 3. Current state

Well populated: regional master data pages (countries/provinces/regencies/districts/villages) backed by the `syailendra_region` addon and the local region catalog plus cached `/api/regions/*` routes; company, roles, menus, docs, and website pages exist. There is route overlap between `/admin` and `/others` for company/roles/employees — consolidate or document the split.

## 4. Planned scope (to be validated)

- One canonical administration home per concern (avoid duplicate `/admin` and `/others` entries).
- Role/permission matrix administration with audit trail.
- Regional master data maintenance and caching strategy.
- Menu/navigation administration and documentation registry.
- Public website content boundaries.

## 5. Dependencies

- Regional catalog provenance and refresh process.
- Decision on canonical route root for administrative pages.
- Menu administration model (database-driven vs code-driven).

## 6. Open questions

- Which of `/admin/*` and `/others/*` is canonical for company, roles, and employees?
- Who may edit roles and menus, and how are changes audited?
- Is the public website managed from the ERP or from a separate CMS?
