---
name: workspace-clone-cleanup
description: "Use when removing temporary clone artifacts safely."
version: 1.0.0
author: "Octa Hub"
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags: [workspace-hygiene, clone-cleanup, database-drop, filestore-cleanup, production-safety]
related_skills: []
---

# Workspace Clone Cleanup

Remove temporary clone artifacts (code directories, databases, filestore directories, staging directories) while protecting production assets. Applies to Octa Hub / Syailendra environments where Odoo runs on `ddistlers-vps` (alias `hostinger-vps`) and code workspaces live on `octa-host`.

## When to Use

Use this skill when you need to remove temporary clone artifacts left behind after feature work, testing, or migration sessions. This includes clone code directories under `/opt/octa/workspace/`, clone databases on the Odoo host, orphan filestore directories, and staging directories. Do not use this skill for production assets — `syailendra_erp` and `/opt/octa/workspace/erp-syailendra` are always protected.

## Always-On Rules

1. **Never delete production assets.** Production database: `syailendra_erp`. Production code root: `/opt/octa/workspace/erp-syailendra`. These are never deletion candidates.
2. **Never delete system databases.** `postgres`, `template0`, `template1`, `db_odoo`, `db_test` are protected unless the user explicitly names them.
3. **Verify no active usage before deletion.** Check for running processes and Docker mount references to the target path. If any exist, stop and ask the user.
4. **Get explicit user approval before every `rm -rf` / `dropdb`.** Recursive deletion is flagged by the environment and requires consent. Do not retry or rephrase after a block — wait for the user.
5. **Delete databases before filestore and staging directories.** Filestore and staging dirs are named after databases; removing the DB first makes orphan filestore cleanup safe.
6. **Verify production health after cleanup.** Confirm `syailendra_erp` is intact, module version unchanged, container status `Up`, and stock record counts match pre-cleanup.

## Procedure

### Step 1 — Inventory clone artifacts
List candidate directories and databases:

```bash
ssh -F /opt/data/.ssh/config octa-host 'ls -la /opt/octa/workspace/'
ssh -F /opt/data/.ssh/config hostinger-vps 'docker exec odoo-db psql -U odoo -d postgres -tAc "SELECT datname FROM pg_database WHERE datistemplate=false ORDER BY 1"'
ssh -F /opt/data/.ssh/config hostinger-vps 'docker exec odoo sh -c "du -sh /var/lib/odoo/filestore/* /var/lib/odoo/sg14_* 2>/dev/null"'
```

Identify clone code directories: any directory under `/opt/octa/workspace/` that is NOT `erp-syailendra` and NOT a user project (trackhub, ddistlers-*, etc.).

Identify clone databases: databases matching clone patterns (e.g. `syailendra_erp_sg*`, `syailendra_erp_fase*`, `scm_test_*`) that are not `syailendra_erp`.

### Step 2 — Verify no active usage
Check processes and Docker mounts for each target:

```bash
ssh -F /opt/data/.ssh/config octa-host 'ps -eo pid,args | grep -E "<clone-name>" | grep -v grep'
ssh -F /opt/data/.ssh/config octa-host 'for c in $(docker ps --format "{{.Names}}"); do docker inspect $c --format "{{range .Mounts}}{{.Source}} {{end}}" | tr " " "\n" | grep -E "<clone-name>"; done'
```

If any process or mount references the target, stop and ask the user before proceeding.

### Step 3 — Get explicit approval
Present the inventory to the user with sizes and wait for explicit approval to delete each category (databases, filestore/staging, code directories). Do not proceed without consent.

### Step 4 — Delete clone databases
On the Odoo host:

```bash
docker exec odoo-db dropdb -U odoo --force <clone-db-name>
```

Repeat for each approved clone database. Skip `syailendra_erp` and system databases.

### Step 5 — Delete orphaned filestore and staging directories
On the Odoo host:

```bash
docker exec -u 0 odoo sh -c "rm -rf /var/lib/odoo/filestore/<clone-db-name>"
docker exec -u 0 odoo sh -c "rm -rf /var/lib/odoo/<staging-dir-name>"
```

Only remove filestore/staging dirs whose matching database no longer exists.

### Step 6 — Delete clone code directories
On octa-host:

```bash
rm -rf -- /opt/octa/workspace/<clone-dir>
```

Guard: skip any path under `/opt/octa/workspace/erp-syailendra`. Do not rely on the presence of a nested `.git` directory — clone code directories may live inside a parent git repo (`/opt/octa`) and have no `.git` of their own. Use `git -C /opt/octa ls-files -- "<path>"` to check if a path is tracked by the parent repo instead.

### Step 7 — Verify production health
Confirm production is untouched:

```bash
ssh -F /opt/data/.ssh/config hostinger-vps 'docker exec odoo-db psql -U odoo -d syailendra_erp -tAc "SELECT count(*) FROM stock_lot"'
ssh -F /opt/data/.ssh/config hostinger-vps 'docker exec odoo sh -c "grep -m1 version /mnt/extra-addons/syailendra_scm/__manifest__.py"'
ssh -F /opt/data/.ssh/config octa-host 'git -C /opt/octa/workspace/erp-syailendra log -1 --oneline'
ssh -F /opt/data/.ssh/config octa-host 'git -C /opt/octa/workspace/erp-syailendra status -sb | head -1'
```

## Pitfalls

- **Guard on `.git` presence fails for nested clones.** If `/opt/octa` is itself a git repo, clone subdirectories under `/opt/octa/workspace/` will not contain their own `.git` directory. Do not use "no `.git` inside" as a reason to skip or delete — check parent repo tracking with `git -C /opt/octa ls-files -- "<path>"` instead.
- **Protected database names must be hardcoded.** `syailendra_erp`, `postgres`, `template0`, `template1`, `db_odoo`, `db_test` are never clone databases even if they match loose patterns. Always exclude them explicitly.
- **Do not retry a blocked recursive delete.** If `rm -rf` is flagged and requires user consent, wait for explicit approval. Rephrasing the same command is not a workaround.
- **Filestore directories survive database drops.** Dropping a database does not remove its filestore under `/var/lib/odoo/filestore/`. Clean filestore orphans separately after confirming the DB is gone.
- **Staging directories are separate from filestore.** Directories like `sg14_base`, `sg14_stage`, `sg14_stage2` under `/var/lib/odoo/` are staging areas, not filestore. Remove them only when their matching clone database is also gone.

## Approval Checklist (present to user before deletion)

- [ ] Clone code directories identified (with sizes)
- [ ] Clone databases identified (with names)
- [ ] Orphan filestore and staging directories identified
- [ ] No active processes or Docker mounts reference any target
- [ ] Production `syailendra_erp` and root repo `erp-syailendra` confirmed excluded
- [ ] User gave explicit approval per category
