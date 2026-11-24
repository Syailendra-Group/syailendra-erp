# Next.js API Route — Odoo JSON-RPC with Partner Auth

Condensed reference for `erp-syailendra-frontend-ops` section 13.

## Quick checklist

- [ ] `getPartnerSession()` → 401 if null
- [ ] `req.formData()` for multipart, not `req.json()`
- [ ] `OdooObjectValue` from `@/lib/odoo/types` for payload
- [ ] `executeKw(model, method, [[recordId], arg1, arg2], {})` — recordset array first
- [ ] File → `public/uploads/<area>/`, public URL in payload
- [ ] `error.match(/^(E_[A-Z_]+):/)` for code extraction
- [ ] Scoped gates: typecheck grep route.ts, prettier --check/write, eslint
- [ ] `chown 1000:1000` after docker cp / SSH write
- [ ] `export PATH=/opt/node/bin:$PATH` in container commands

## Anti-patterns

| Anti-pattern | Why it breaks | Fix |
|---|---|---|
| `import { OdooFieldValue } from '@/lib/odoo/client'` | Not exported by client module | Import type from `@/lib/odoo/types` |
| `executeKw(model, method, [recordId, accessId], {})` | args[0] must be `[recordId]` | Use `[[recordId], accessId]` |
| `payload.lat = value` on `OdooFieldValue` | Primitive union has no `lat` key | Use `OdooObjectValue` |
| Base64 image in JSON payload | Bloats RPC, fails size limits | Write to disk, store `/uploads/...` URL |
| Mixed `getPartnerSession()` + `getSession()` | Different secrets/audiences | One guard per route |
| Bare `npm`/`node` in container | Exits 127, PATH missing | `export PATH=/opt/node/bin:$PATH` |
| `chown` directory without `-R` | Contents stay uid 10000 | Enumerate files, chown each |
