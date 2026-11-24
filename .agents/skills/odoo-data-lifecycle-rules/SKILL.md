---
name: odoo-data-lifecycle-rules
description: "Use when purging or resetting Odoo ERP data safely."
version: 1.2.0
author: "Kael (octadev)"
license: MIT
metadata:
  hermes:
    tags:
      - odoo
      - odoo-18
      - data-lifecycle
      - database-reset
      - orm
      - relational-integrity
      - backup
---

# Odoo Data Lifecycle & Safe Purge Protocol

## Overview
This skill governs the execution of safe bulk deletion, data pruning, and database reset procedures in Odoo 18 ERP environments without violating PostgreSQL relational constraints or corrupting system accounts.

## When to Use
- Emptying or purging master data (partners, suppliers, products, regional entries) in Odoo databases.
- Preparing test database resets or demo data purges before production seeding.
- Writing safe scripts that call `unlink()` via XML-RPC, JSON-RPC, or in-module ORM methods.
- Preventing relational lockups or accidental deletion of admin, company, and fiscal localization records.

---

## 1. Mandatory Pre-Wipe Backup & Git Hygiene
Before executing any destructive `unlink()` operation across multiple models:
- Always generate a compressed full database dump directly from the database container or host:
  ```bash
  docker exec odoo-db pg_dump -U odoo <db_name> | gzip > /path/to/backups/<db_name>_pre_wipe_$(date +%Y%m%d_%H%M%S).sql.gz
  ```
- Verify backup non-emptiness (> 1 MB) and file integrity with `gzip -t <file>.sql.gz` before touching any records.
- Ensure all backup dump patterns (`*.sql`, `*.sql.gz`, `backups/`) are strictly added to `.gitignore` to prevent multi-megabyte archives from polluting git history.

---

## 2. System Identity & Tenant Isolation Guard
The `res.partner` table holds core operational accounts that must **never** be deleted:
- ID 1: Root / OdooBot (`base.partner_root`)
- Partner linked to Administrator (`base.partner_admin` or user's `partner_id`)
- Company Partners: Partners referenced by `res.company.partner_id`

### User ID vs Partner ID Distinction:
`res.users.id` (User UID) is **not** identical to `res.partner.id`. An administrator with `res.users` UID 2 frequently points to `res.partner` ID 3. Never check partner identity by comparing `partner.id == user.id`. Always query `res.users` and extract `partner_id` dynamically.

### Safe Scope Extraction Pattern:
```python
# Isolate system IDs to prevent authentication lockouts
protected_partner_ids = {1, 2, 3}

# Dynamically resolve all user partner IDs
users = models.execute_kw(db, uid, password, 'res.users', 'search_read', [[]], {'fields': ['id', 'partner_id']})
for u in users:
    if u.get('partner_id'):
        protected_partner_ids.add(u['partner_id'][0])

# Dynamically resolve all company partner IDs
companies = models.execute_kw(db, uid, password, 'res.company', 'search_read', [[]], {'fields': ['id', 'partner_id']})
for c in companies:
    if c.get('partner_id'):
        protected_partner_ids.add(c['partner_id'][0])

# Filter targets with explicit prefix/domain and exclusions using proper Polish notation
domain = [
    '&',
    '|', '|',
    ('ref', '=like', 'FMR%'),
    ('ref', '=like', 'DST%'),
    ('ref', '=like', 'SUP%'),
    ('id', 'not in', list(protected_partner_ids))
]
target_partners = models.execute_kw(db, uid, password, 'res.partner', 'search', [domain])
```

---

## 3. Pre-Deletion Transaction Dependency Checks
Odoo ORM enforces strict business guards preventing `unlink()` on records with linked transactions (`stock.move`, `stock.quant`, `purchase.order`, `account.move`).

Always inspect dependent models before calling `unlink()`:
```python
# Check blocking moves on target products or partners
blocking_stock = env['stock.move'].search_count([('product_id', 'in', variant_ids)])
blocking_po = env['purchase.order'].search_count([('partner_id', 'in', partner_ids)])
blocking_invoices = env['account.move'].search_count([('partner_id', 'in', partner_ids)])

if blocking_stock > 0 or blocking_po > 0 or blocking_invoices > 0:
    raise RuntimeError("Cannot unlink: active transactions exist. Purge transactions or cancel orders first.")
```

---

## 4. Topological Cascade Deletion Order
Always purge records from child (leaf) to parent (root) to prevent `psycopg2.errors.ForeignKeyViolation` or `models.ValidationError`:

1. **Regional Hierarchies (Testing & Global):**
   - Level 5: Villages / Subdistricts (`res.country.subdistrict`)
   - Level 4: Districts (`res.country.district`)
   - Level 3: Regencies / Cities (`res.country.city`)
   - Level 2: Provinces / States (`res.country.state`)
     - *Constraint:* `res.partner.state_id` and `res.country.city.state_id` have `RESTRICT`.
     - *Procedure:* Clear `state_id = False` on referenced companies and partners first, then unlink states in chunks (e.g. 500 per batch).
   - Level 1: Countries (`res.country`)
     - *Hard-Gate Constraint:* `account.tax.country_id` has `RESTRICT` and `required=True` for localization packages (e.g. `l10n_id`).
     - *Company Alignment:* Standardize `country_id = 100` and `account_fiscal_country_id = 100` across all `res.company` records prior to foreign country unlinking so demo companies (e.g. US/BE) do not block deletion with foreign key violations.
     - *Procedure:* Clear foreign country references on `res.partner` (`country_id = False`) and `crm.lead` (`country_id = False`). Non-tax countries (241 foreign countries) can then be safely unlinked in 50-item chunks once `res.country.state` is cleared. The domestic fiscal country (e.g. Indonesia ID 100) must be retained unless active taxes and fiscal charts are intentionally reset.
2. **Product & Lot Catalogs:**
   - Tracking & Serial Lots (`stock.lot` linked to target product variants)
     - *Pitfall:* Odoo blocks `product.template.unlink()` with `Constraint: stock_lot_product_id_fkey` if lots exist, even if those lots have 0 quants and 0 moves. Unlink or archive `stock.lot` first.
   - Product Variants (`product.product`)
   - Product Templates (`product.template`)
3. **Supply Chain Partners & Hierarchies:**
   - Partner Records (`res.partner` with business refs)
   - Partner Categories (`res.partner.category` groups)
     - *Pitfall:* Always delete child categories (`parent_id != False`) before parent categories (`parent_id == False`).

---

## 5. XML-RPC Domain Syntax Pitfalls

### Pitfall 1: Array Over-Nesting
In XML-RPC `search` and `search_count`, domain criteria must be passed as a single list of criteria:
- ❌ **Incorrect:** `[[[('field', '=', 'val')]]]` (triggers `IndexError: tuple index out of range` in `expression.is_false`).
- ✅ **Correct:** `[[('field', '=', 'val')]]` or positional arg `[('field', '=', 'val')]`.

### Pitfall 2: Polish Notation Operators
Odoo domain uses prefix notation. When combining multiple ORs with an exclusion filter:
- ❌ **Incorrect:** `['|', '|', c1, c2, c3, ('id', 'not in', ids)]` (missing `&` causes invalid operand binding).
- ✅ **Correct:** `['&', '|', '|', c1, c2, c3, ('id', 'not in', ids)]` (combines all 3 OR conditions under the AND exclusion).

---

## 6. Post-Purge Verification Standard
Immediately following batch `unlink()`:
- Execute `search_count()` on each target domain to verify count is exactly `0`.
- Verify admin user login credentials and session tokens via XML-RPC `authenticate()`.
- Confirm `res.company` partner and company records remain intact.
- Run frontend E2E check to confirm data tables render empty states gracefully.
