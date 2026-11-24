# HRM — Human Resource Management (HRIS)

**Status:** Skeleton — structure and verified route inventory recorded; business
requirements not yet mapped with the owner. Do not treat the "Planned scope" section as
approved requirements.

**Primary entity:** SBI (corporate HR)

## 1. Purpose

Manage employee records, organisation structure, attendance, leave, payroll inputs, and performance for the group. HR data is corporate-sensitive and must not be visible to operational pillars by default.

## 2. Route inventory (verified 2026-11-23)

| Route | Notes |
| :--- | :--- |
| `(dashboard)/hris` | |
| `(dashboard)/hr` | |
| `(dashboard)/employees` | |
| `(dashboard)/admin/employees` | |
| `(dashboard)/admin/departments` | |
| `(dashboard)/admin/roles` | |

## 3. Current state

Frontend pillar exists (`src/features/hrm/`) with routes under `/hris`, `/hr`, `/employees`, and `/admin`. Messages namespace `src/messages/*/hrm` exists. No verified Odoo HR addon extension was found in `addons/` during this pass; confirm which HR modules are installed on the Odoo host before planning.

## 4. Planned scope (to be validated)

- Employee master and org unit mapping to Odoo `hr.employee` / `hr.department`.
- Attendance capture (clock-in/out, GPS where applicable) and monthly recap.
- Leave and permission requests with approval flow.
- Daily/periodic work reports.
- Performance reviews and payroll input preparation (Finance consumes the result).

## 5. Dependencies

- Odoo HR modules installed and licensed for the target edition.
- Corporate role model and data-visibility rules (who may see salary, identity, and documents).
- Decision: which attendance capture is authoritative (web, mobile, or device).

## 6. Open questions

- Should HR keep its own `/hrm` route root, or is `/hris` the permanent canonical root (see Q-06)?
- Which entity owns payroll execution: SBI or a shared service?
- Which employee attributes are sensitive-grade and need extra ACL?
