# Multi-Company Scope Audit (Odoo record rules vs. frontend RPC)

Use when a page shows master data that belongs to another legal entity, or before
adding `allowed_company_ids` to a service that never sent it.

## Why the rule does not bite on its own

Record rules resolve `company_ids` from the RPC **context**. When a client never sends
`allowed_company_ids`, Odoo falls back to the user's own company set. If the integration
user is a member of every company (common for an admin API account), the rule is a no-op
and every entity's rows stay visible — the page looks healthy while scoping is absent.

## Step 1 — Inventory the data model (read-only)

```sql
SELECT id, name FROM res_company ORDER BY id;
SELECT COUNT(*) total, COUNT(company_id) with_company, COUNT(*) - COUNT(company_id) null_company
  FROM res_partner;
SELECT company_id, COUNT(*) FROM res_partner GROUP BY company_id ORDER BY company_id;
SELECT u.id, u.login, array_agg(c.name) AS companies
  FROM res_users u
  JOIN res_company_users_rel r ON r.user_id = u.id
  JOIN res_company c ON c.id = r.cid
 WHERE u.id = <integration uid> GROUP BY u.id, u.login;
```

Also list the rules that exist, so you know which models are actually guarded:

```sql
SELECT r.id, r.name, m.model, r.domain_force, r.global
  FROM ir_rule r JOIN ir_model m ON m.id = r.model_id
 WHERE m.model IN ('res.partner','syailendra.crop','syailendra.farm')
 ORDER BY m.model, r.id;
```

## Step 2 — Prove visibility with the real credentials

Run the same `search_count` with no context and then once per company using
`{ context: { allowed_company_ids: [id] } }`. `scripts/odoo-rpc-probe.mjs --company-sweep`
does exactly this without printing secrets.

Interpretation:

| Observation | Meaning |
|---|---|
| no-context count == per-company count for the session company | Scoping is **behavior-preserving** today; safe to add |
| no-context count >> per-company count | The page is leaking other entities' rows right now |
| per-company count is 0 for every company | The domain itself is wrong — fix the domain before scoping |
| every count identical and small | Only `company_id IS NULL` rows match; the discriminator is unpopulated |

A rule allowing `('company_id','=',False)` keeps unowned rows visible in every
company. Expect a small non-zero count and identify those rows explicitly instead of
treating them as leakage.

## Step 3 — Apply the established shape

1. Action: `async function companyScope(): Promise<number[] | undefined> { const s = await getSession(); return s ? [s.companyId] : undefined }`
2. Service method: add `allowedCompanyIds?: number[]` as the last parameter and thread it
   into every `searchRead` / `searchCount` / `create` / `write` / `unlink` call on that
   path — a read-only scope on a CRUD service is half a fix.
3. `session.companyId` is the user's **main company**, not the UI entity switcher. The
   switcher is client state; adding scope will not make it a per-request selector.

## Step 4 — State the exceptions out loud

Unauthenticated surfaces (public lot trace) have no session, so they legitimately stay
unscoped. Record that as a documented exception; do not invent a company id for them and
do not silently leave an authenticated service unscoped.

## Step 5 — Verify and report

Re-run the probe for each affected page's domain, then run the full gate sequence and
rebuild. Report before/after counts per page; "scoped" is only true when the number
actually changed or was proven equal by measurement.
