# Clone Identification Patterns

Reusable patterns for distinguishing clone artifacts from production assets in Octa Hub / Syailendra environments.

## Database name patterns

Production (never delete):
- `syailendra_erp`
- `postgres`, `template0`, `template1` (system)
- `db_odoo`, `db_test` (user-managed, not clones unless explicitly confirmed)

Clone (candidates for deletion):
- `syailendra_erp_sg*` (SG phase test databases)
- `syailendra_erp_fase*` (fase test databases)
- `scm_test_*` (SCM test databases)
- Any database cloned from `syailendra_erp` for feature testing

## Code directory patterns

Production root (never delete):
- `/opt/octa/workspace/erp-syailendra`

Clone code directories (candidates for deletion):
- Any directory under `/opt/octa/workspace/` that is not `erp-syailendra` and not a known user project (trackhub, ddistlers-*, etc.)
- Hidden snapshot directories (e.g. `.sg9-restore-head`, `.sg12-e2e-*`)
- Verification clones (e.g. `sg14_verify`)

## Filestore patterns

- `/var/lib/odoo/filestore/<database-name>` — matches a database name
- Orphan filestore: directory exists but matching database has been dropped

## Staging directory patterns

- `/var/lib/odoo/sg14_base`, `/var/lib/odoo/sg14_stage`, `/var/lib/odoo/sg14_stage2` — staging areas tied to clone databases
- Remove only when matching clone database is also gone

## Detection commands

```bash
# List all non-template databases
psql -U odoo -d postgres -tAc "SELECT datname FROM pg_database WHERE datistemplate=false ORDER BY 1"

# List workspace directories
ls -la /opt/octa/workspace/

# Check if path is tracked by parent git repo (for nested clones without .git)
git -C /opt/octa ls-files -- "<path>"

# List filestore directories
ls -d /var/lib/odoo/filestore/*
ls -d /var/lib/odoo/sg14_*
```
