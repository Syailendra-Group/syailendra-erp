---
name: odoo-addon-modular-architecture
description: "Use when modularizing or migrating Odoo 18 addons/stacks."
version: 1.1.0
author: "Octa Hub"
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags:
      - odoo-18
      - addon-architecture
      - modular-design
      - clean-code
      - oca-standards
      - repo-sync
      - zero-port-collision-upgrade
---

# Odoo Addon Modular Architecture & Repository Synchronization Standard

## When to Use
Use whenever structuring, refactoring, or integrating custom Odoo 18 addons in unified repository ecosystems (Next.js frontend + Odoo backend). Applies to file layout, model separation, security ACLs, repository co-location, and container upgrades.

## Core Architecture & Workflow Rules

### 1. The One-Model-Per-File Decomposition Standard (Single Responsibility)
- **Eliminate Monolithic Files:** Never combine multiple unrelated models into a single file (e.g. avoid dumping geocoding models and partner extensions into one `regional.py`).
- **File Naming Convention:** Name files after the technical model name in lowercase `snake_case` matching the Odoo model dot notation replaced with underscores:
  - `res.country` -> `models/res_country.py`
  - `res.country.state` -> `models/res_country_state.py`
  - `res.country.city` -> `models/res_country_city.py`
  - `res.country.district` -> `models/res_country_district.py`
  - `res.country.subdistrict` -> `models/res_country_subdistrict.py`
  - `res.partner` -> `models/res_partner.py`
  - `res.company` -> `models/res_company.py`
- **Ordered Package Exports:** In `models/__init__.py`, import each model file sequentially in dependency order (geographical models before business models referencing them):
  ```python
  # -*- coding: utf-8 -*-
  from . import res_country
  from . import res_country_state
  from . import res_country_city
  from . import res_country_district
  from . import res_country_subdistrict
  from . import res_partner
  from . import res_company
  ```

### 2. Root Addon Path & Domain Subpackages (`addons/<technical_name>/`)
- In fullstack architectures connecting a modern web frontend (Next.js) with Odoo CE via JSON-RPC, keep a multi-addon repository under `addons/<technical_name>/`, one folder per Odoo module whose folder name **equals** the module technical name (e.g. `addons/syailendra_region/`, `addons/syailendra_scm/`). A single-addon repo may host the addon directly at `addons/`, but it MUST be restructured with `git mv addons addons_tmp/<name> && git mv addons_tmp addons` as soon as a second addon appears — otherwise both addons collide in the same tree.
- Group `models/` into domain subpackages:
  ```text
  addons/
  ├── __init__.py
  ├── __manifest__.py
  ├── security/ir.model.access.csv
  └── models/
      ├── __init__.py          # from . import region, company, partner
      ├── region/__init__.py   # res_country*.py
      ├── company/__init__.py  # res_company.py
      └── partner/__init__.py  # res_partner.py
  ```
- **Avoid Deep Nesting:** Never nest under `backend/addons/<addon>/` or mix unrelated business models (`res.company`, `res.partner`) inside a `region/` folder. Mirror the exact `/addons/` tree into `/opt/octa/data/odoo/addons/<technical_name>/`.
- **Synchronization Contract:**
  1. Bump `__manifest__.py` version (e.g. `18.0.1.x.0`) before refactoring so `ir_module_module.latest_version` registers the update.
  2. Maintain the repository copy as the Single Source of Truth (SSoT) for version control and mirror the exact file and folder layout into the Odoo runtime directory (`/opt/octa/data/odoo/addons/<addon_name>/`).
  3. Delete obsolete monolithic files (e.g. old `models/regional.py`) and purge all `__pycache__` directories in **both** the repository and runtime addon trees — stale files or `.pyc` bytecode cause shadow imports and duplicate model registration.
  4. Verify container user UID/GID via `docker exec <odoo_container> id` before setting ownership: apply container UID/GID (`chown -R 100:101`, `chmod -R 755` / `644` for files) on the runtime addon tree, and keep workspace UID/GID (`1000:1000`) on the repository copy so host `git` operations do not fail with permission errors.

### 3. Zero Port Collision CLI Addon Upgrade Protocol
- When upgrading Odoo modules inside running Docker containers, standard `odoo -u <addon>` commands bind to port `8069` and fail with `[Errno 98] Address already in use`.
- **Mandatory Safe Upgrade Pattern:** Always pass `--http-port 8079 --stop-after-init` to isolate the temporary CLI process, followed by a graceful container restart:
  ```bash
  docker exec odoo-web odoo -c /etc/odoo/odoo.conf -d <database_name> -u <addon_name> --http-port 8079 --stop-after-init
  docker restart odoo-web
  ```
- **Post-Upgrade Verification Gate:**
  1. Confirm `ir_module_module` reports `state = 'installed'` and the bumped `latest_version`, and verify `docker logs --tail 50 odoo-web` shows clean initialization with zero tracebacks.
  2. Check PostgreSQL row counts on affected tables to prove decomposing models across files preserved existing records (`_name` and `_inherit` identifiers must stay identical).
  3. Verify live JSON-RPC and frontend E2E routes; when automating login on Turnstile-protected forms, wait for `input[name="cf-turnstile-response"]` to be non-empty before submitting, otherwise the form silently redirects back to `/login`.

### 4. Addon Deployment & Odoo 18 API Pitfalls (verified on build 18.0-20261112)
- **Bind-mounted `addons` is not writable by the SSH user.** A `deploy` user without passwordless sudo cannot `touch`/`cp` into `/home/deploy/stack/odoo/addons`. Deploy with `docker cp <local_dir> odoo:/mnt/extra-addons/<addon>`, then `docker exec -u 0 odoo chown -R 100:101 /mnt/extra-addons/<addon>`. Never assume host-side write access.
- **`models.Constraint` does not exist in this build.** Declare uniqueness with the classic `_sql_constraints = [(name, 'unique(...)', message)]`.
- **`res.users` still exposes `groups_id`**, not `group_ids`; assigning `group_ids` raises `ValueError: Invalid field 'group_ids' on model 'res.users'`.
- **`ir.sequence` prefix `%(y)s` yields a 2-digit year.** Use `%(year)s` for 4-digit codes that must match documented batch IDs (e.g. `HAR-2026-00001`).
- **Always install on a clone database first:** `createdb -T template0 <db>_test` + `pg_restore --no-owner --no-privileges`, run the `-i <addon> --http-port 8079 --stop-after-init` install, exercise the ORM with `odoo shell --no-http` ending in `env.cr.rollback()`, then install on production.
- **Prove ACLs with a real restricted user**, not admin: create a user with only the module's base group and assert `AccessError` on write/create of manager-only models.
- **Reusable harness:** `templates/odoo_shell_smoke_test.py` — create → assert → `env.cr.rollback()`, printing `RESULT_<LABEL>=<value>` lines so verification is a deterministic grep instead of eyeballed logs.

### 5. Legacy Field Deprecation Across Odoo ↔ Next.js
Dropping a custom field the frontend still reads breaks list/form pages at **runtime**, not at build time, so the build stays green and the failure surfaces to users. Order the work:
1. **Count consumers before planning.** `grep -rn '<field>' src/ --include='*.ts' --include='*.tsx' | grep -v messages/` and count the files. A field touched by a `*.service.ts` mapper + its Zod schema + columns + form sections is a coordinated change, not a one-line model edit; state the number in the plan.
2. **Migrate data first, drop later.** Convert values into the new model, prove parity on a clone DB, and only then remove the column.
3. **Refactor and deploy consumers first**, leaving the old field present but unused; then bump the addon version to `18.0.1.x.0` and run `-u <addon> --http-port 8079 --stop-after-init` followed by `docker restart`.
4. **Never ship field removal and data seeding in the same release** — if the conversion turns out wrong, the old column is the only way to recompute it.
5. **Keep migration-era schemas permissive.** Zod fields fed by legacy rows (missing domicile, missing area, missing coordinates) must stay `.optional()`/nullable or the edit form rejects historical records the seeder just imported.

### 6. Cross-VPS Odoo 18 Stack Migration & Decommissioning Protocol
When migrating an active Odoo 18 backend (PostgreSQL database + custom addons + filestore) from a staging/shared VPS to a dedicated target VPS:

1. **Pre-Flight Network & Private LAN Discovery:**
   - Inspect both hosts' network interfaces (`ip -4 addr show | grep inet`) before routing over the public internet. Co-located VPS nodes often share a private LAN subnet (e.g. `10.10.0.0/22` with `<1ms` latency). Use the private LAN IP for database streaming, `rsync`, and headless frontend `ODOO_BASE_URL` communication to achieve zero-latency RPC calls without exposing port `8069` publicly.
2. **Target Stack Provisioning & Resource Guardrails:**
   - Provision isolated directories on the target VPS (`/opt/app/stacks/odoo`, `/opt/app/data/odoo/{addons,web,config}`, `/opt/app/data/odoo-db`).
   - Match the source PostgreSQL major version (`postgres:15-alpine`) in `compose.yaml` to prevent collation or dump/restore version mismatches.
   - Enforce memory and CPU caps (`odoo-web`: `1200M` RAM / `1.5` CPUs, `workers = 2`, `max_cron_threads = 1`; `odoo-db`: `384M` RAM / `1.0` CPU) and Docker log rotation (`max-size: 20m`, `max-file: 3`).
3. **Atomic Trio Transfer (Addons + Filestore + Database):**
   - **Custom Addons:** Sync the clean repository `/addons/` SSoT (purged of `__pycache__`) to the target `/opt/app/data/odoo/addons/<addon_name>/`.
   - **Filestore (`/var/lib/odoo`):** Archive and transfer `/opt/octa/data/odoo/web/filestore/<db_name>` so attachments, binary fields, and assets remain intact.
   - **Container UID/GID Ownership:** Inspect the runtime UID/GID inside the target container (`docker run --rm odoo:18.0 id` — typically `100:101` or `101:101` for `odoo`, and `70:70` for `postgres:alpine`) and `chown -R` the mounted host directories before starting the stack.
   - **Database Dump & Restore:** Run `docker exec <source_db> pg_dump -Fc -U odoo -d <db_name> > odoo_migration.dump`, verify non-zero file size and `pg_restore --list`, transfer to the target host, create the target database, and restore via `pg_restore --clean --if-exists --no-owner -U odoo -d <db_name>`.
4. **Parity Verification & Frontend Cutover:**
   - Compare row counts across core and custom tables (`ir_module_module` installed count, `res_company`, `res_partner`, `product_template`, and regional hierarchy tables `res_country_state` / `city` / `district` / `subdistrict`) between source and target.
   - Run the zero-port-collision CLI upgrade (`--http-port 8079 --stop-after-init`) on the target container, restart `odoo-web`, and switch `ODOO_BASE_URL` in the frontend `.env`.
5. **Safe Source Decommissioning (Disk & RAM Reclamation):**
   - Retain a compressed cold backup snapshot (`odoo_final_pre_decommission.dump`) in `/opt/data/backups/` on the source VPS.
   - Only after target parity and frontend E2E login/CRUD are verified, run `docker compose down` on the source Odoo stack, remove `odoo:18.0` and unused Postgres images, and remove `/opt/octa/data/odoo*` to reclaim ~3.7 GB disk and ~1.2 GB RAM.
