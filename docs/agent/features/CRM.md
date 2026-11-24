# CRM — Customer Relationship Management

**Status:** Skeleton — structure and verified route inventory recorded; business
requirements not yet mapped with the owner. Do not treat the "Planned scope" section as
approved requirements.

**Primary entity:** SAMMEND (commercial)

## 1. Purpose

Manage leads, opportunities, quotations, and the B2B sales pipeline for essential oils and derivatives, including sample distribution governance.

## 2. Route inventory (verified 2026-11-23)

| Route | Notes |
| :--- | :--- |
| `(dashboard)/crm` | |

## 3. Current state

Landing route `/crm` only; `src/features/crm/` exists. Messages namespace `crm` exists. No CRM-specific addon extension was verified.

## 4. Planned scope (to be validated)

- Lead and opportunity pipeline with stages and ownership.
- Account and contact management with company scoping.
- Quotation and sample-request handling (sample quota: max three free variants per buyer; 5 ml regular / 1 ml precious oils).
- Activity planning and follow-up reminders.
- Conversion reporting.

## 5. Dependencies

- Product catalogue from SCM/commodity master data.
- Decision on quotation/pricing source (Odoo sale module vs external).
- Accurate Online boundary for commercial documents (see `docs/agent/08_ACCURATE_INTEGRATION.md`).

## 6. Open questions

- Is Odoo `crm`/`sale` the system of record for quotations, or is the ERP a front end to Accurate?
- Who approves free samples beyond the quota?
- Which pipeline metrics matter to the owner (volume, value, conversion window)?
