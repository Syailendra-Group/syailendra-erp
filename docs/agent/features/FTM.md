# FTM — Finance and Tax Management

**Status:** Skeleton — structure and verified route inventory recorded; business
requirements not yet mapped with the owner. Do not treat the "Planned scope" section as
approved requirements.

**Primary entity:** SBI (finance and tax)

## 1. Purpose

Manage the financial view of the business: invoicing, cost, tax obligations, and integration with the accounting system of record.

## 2. Route inventory (verified 2026-11-23)

| Route | Notes |
| :--- | :--- |
| `(dashboard)/ftm` | |

## 3. Current state

Landing route `/ftm` only; `src/features/ftm/` exists. Requirements not yet mapped.

## 4. Planned scope (to be validated)

- Financial dashboards fed from the accounting system.
- Invoice/payment status visibility for operational users.
- Cost and margin inputs (never exposed on public trace).
- Tax reporting support and period close checklists.

## 5. Dependencies

- Decision on the accounting system of record (Accurate Online vs Odoo accounting).
- Chart of accounts and tax configuration ownership.
- Data contract and reconciliation rules for the integration.

## 6. Open questions

- Does the ERP create accounting documents or only mirror them?
- Who owns tax configuration and period close?
- Which cost data may be visible to operational roles?
