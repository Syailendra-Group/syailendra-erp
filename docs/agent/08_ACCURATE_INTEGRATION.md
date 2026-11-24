# 08 — Accurate Online Integration

## Intent

Integrate Accurate Online as an external accounting system only after the ERP
master-data and event contract is agreed. Odoo remains the primary operational source
for suppliers, inventory, lots, QC, and production unless the owner explicitly changes
system ownership.

## Security and authorization

- OAuth credentials are obtained through the interactive authorization flow.
- No access token, refresh token, client secret, or authorization code may be committed
  or written into documentation.
- Store approved values in `.env.local`, mode 600; use variable names only in
  `.env.example`.
- Keep OAuth scopes at the minimum needed; prefer read-only until write-back is approved.
- Redact tokens, personal identifiers, and financial records from logs and test output.

## Contract work before implementation

1. Confirm Accurate tenant/company, OAuth app, account owner, and authorized scopes.
2. Agree external ID and idempotency keys for every synchronized record.
3. Define direction by object (read, write, or both) and conflict resolution.
4. Define retry/backoff, pagination, rate limits, token refresh, and reconciliation.
5. Build sandbox contract tests; never validate write calls against production without
   explicit approval.

## Candidate mapping (not yet approved)

| Odoo object | Accurate candidate | Direction |
| :--- | :--- | :--- |
| `res.partner` | Customer/vendor | To be decided per partner type |
| `product.template` | Item | Odoo → Accurate candidate |
| `sale.order` / invoice | Sales invoice | To be decided |
| Purchase/expense | Purchase invoice | To be decided |
| Payments | Receipt/payment | To be decided |

## Observability

Log request correlation ID, object type/ID, operation, status, and retry count. Never
log access tokens or full financial payloads. Persist sync failures with an actionable
reason and replay only through an idempotent operation.
