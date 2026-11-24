# Production Health Verification After Clone Cleanup

Standard post-cleanup verification commands to confirm production assets are untouched.

## Database integrity

```bash
# Confirm production database exists and is queryable
ssh -F /opt/data/.ssh/config hostinger-vps 'docker exec odoo-db psql -U odoo -d syailendra_erp -tAc "SELECT current_database()"'

# Confirm key record counts unchanged
ssh -F /opt/data/.ssh/config hostinger-vps 'docker exec odoo-db psql -U odoo -d syailendra_erp -tAc "SELECT count(*) FROM stock_lot"'

# Confirm module version unchanged
ssh -F /opt/data/.ssh/config hostinger-vps 'docker exec odoo sh -c "grep -m1 version /mnt/extra-addons/syailendra_scm/__manifest__.py"'
```

## Code repository integrity

```bash
# Confirm root repo is intact and on expected commit
ssh -F /opt/data/.ssh/config octa-host 'git -C /opt/octa/workspace/erp-syailendra log -1 --oneline'

# Confirm working tree is clean (no unexpected changes)
ssh -F /opt/data/.ssh/config octa-host 'git -C /opt/octa/workspace/erp-syailendra status -sb | head -1'
```

## Container health

```bash
# Confirm Odoo and database containers are running
ssh -F /opt/data/.ssh/config hostinger-vps 'docker ps --format "{{.Names}}|{{.Status}}" | grep -E "^odoo|^odoo-db"'

# Confirm filestore production size unchanged
ssh -F /opt/data/.ssh/config hostinger-vps 'docker exec odoo sh -c "du -sh /var/lib/odoo/filestore/syailendra_erp"'
```

## Acceptance criteria

- `syailendra_erp` is queryable and returns expected record counts
- Module version matches pre-cleanup version
- `erp-syailendra` git repo is at expected commit with clean status
- Containers `odoo` and `odoo-db` report `Up`
- Production filestore size unchanged
