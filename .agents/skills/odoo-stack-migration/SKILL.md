---
name: odoo-stack-migration
description: "Use when migrating or proxying Odoo Docker stacks."
version: 1.0.0
author: "Octa Hub"
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags:
      - odoo-18
      - vps-migration
      - docker-compose
      - caddy-reverse-proxy
      - postgresql-backup
      - filestore-sync
      - zero-downtime
---

# Odoo Stack Provisioning, Cross-VPS Migration & Reverse Proxy Standard

## When to Use
Use when deploying a new Odoo 17/18/19 Docker Compose stack on a target VPS, migrating an active Odoo backend (PostgreSQL database, custom addons, and filestore) across servers, configuring Caddy/Nginx HTTPS reverse proxying for Odoo, or decommissioning an old Odoo stack to reclaim host disk and memory.

## Core Procedure

### 1. Pre-Flight Telemetry & Private LAN Discovery
Before transferring data or configuring endpoints, inspect both source and target hosts:
1. **Hardware Headroom:** Verify target VPS available RAM (`free -h`, require `>= 1.5 GB` available) and disk space (`df -h /`, require `>= 10 GB` free).
2. **Private Subnet Check:** Inspect network interfaces (`ip -4 addr show | grep inet`) on both VPS nodes. When both nodes reside on the same datacenter private LAN (e.g. `10.10.0.0/22`), use the private LAN IP for `pg_dump`/`scp`/`rsync` transfers and internal RPC calls (`< 1 ms` latency, zero public bandwidth usage).
3. **Database Inventory:** Audit installed custom modules (`SELECT name, state, latest_version FROM ir_module_module WHERE state = 'installed'`) and baseline table row counts (`res_company`, `res_partner`, `product_template`, and custom models) on the source database.

### 2. Target Stack Provisioning (`compose.yaml` & `odoo.conf`)
Create an isolated stack directory (`/opt/app/stacks/odoo`) and persistent data directories (`/opt/app/data/odoo/{addons,web,config}` and `/opt/app/data/odoo-db`):

- **Canonical `compose.yaml` Guardrails:**
  - Pin exact image tags matching the source major version (`odoo:18.0` and `postgres:15-alpine`) to avoid binary/collation incompatibilities during `pg_restore`.
  - Bind Odoo HTTP port strictly to loopback (`127.0.0.1:8069:8069`) or an internal Docker bridge (`app-net`) — never expose port `8069` or `5432` directly on `0.0.0.0`.
  - Configure `depends_on` with `condition: service_healthy` using `pg_isready -U odoo -d postgres`.
  - Enforce resource limits (`odoo-web`: `1200M` RAM / `1.5` CPUs; `odoo-db`: `384M` RAM / `1.0` CPU) and log rotation (`max-size: 20m`, `max-file: 3`).

- **Production `odoo.conf` Tuning:**
  ```ini
  [options]
  admin_passwd = <strong-random-secret>
  db_host = odoo-db
  db_port = 5432
  db_user = odoo
  db_password = <db-password>
  addons_path = /mnt/extra-addons,/usr/lib/python3/dist-packages/odoo/addons
  data_dir = /var/lib/odoo
  proxy_mode = True
  workers = 2
  max_cron_threads = 1
  limit_memory_soft = 1073741824
  limit_memory_hard = 1363148800
  limit_time_cpu = 120
  limit_time_real = 240
  list_db = False
  ```

### 3. Caddy Reverse Proxy Integration
Add the virtual host block to the target `Caddyfile`:
```caddyfile
odoo.example.com {
    reverse_proxy odoo-web:8069 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {http.request.header.X-Forwarded-For}
        header_up X-Forwarded-Proto {scheme}
    }

    @websocket {
        header Connection *Upgrade*
        header Upgrade websocket
    }
    reverse_proxy @websocket odoo-web:8069

    encode gzip zstd
}
```
Validate and hot-reload Caddy without dropping active connections:
```bash
docker exec caddy caddy validate --config /etc/caddy/Caddyfile
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

### 4. Atomic Trio Migration (Addons + Filestore + Database)
1. **Sync Custom Addons:** Transfer the clean addon directory from the repository SSoT (purged of `__pycache__`) to `/opt/app/data/odoo/addons/`.
2. **Sync Filestore:** Archive and transfer `/opt/octa/data/odoo/web/filestore/<source_db>` to `/opt/app/data/odoo/web/filestore/<target_db>`. When renaming the database (e.g. from `odoo_dev` to `syailendra_erp`), rename the filestore subdirectory to match `<target_db>` exactly, otherwise attachments and company logos break.
3. **Set Container Ownership:** Apply the container runtime UIDs before starting services:
   ```bash
   chown -R 101:101 /opt/app/data/odoo
   chown -R 70:70 /opt/app/data/odoo-db
   ```
4. **Dump & Restore Database:**
   ```bash
   # On source VPS (also copy to /opt/data/backups/ for permanent retention)
   docker exec odoo-db pg_dump -Fc -U odoo -d <source_db> > /tmp/odoo_migration.dump

   # On target VPS
   docker exec odoo-db createdb -U odoo -E UTF8 <target_db>
   docker exec -i odoo-db pg_restore --clean --if-exists --no-owner -U odoo -d <target_db> < /tmp/odoo_migration.dump
   ```

### 5. Post-Restore Parity Verification & Cutover
1. **Update System Parameters:** Update `web.base.url` in `ir_config_parameter` to the new HTTPS domain and set `web.base.url.freeze = True` so admin logins from internal IPs do not overwrite the public URL.
2. **Zero-Port-Collision Module Upgrade:**
   ```bash
   docker exec odoo-web odoo -c /etc/odoo/odoo.conf -d <target_db> -u <custom_addon> --http-port 8079 --stop-after-init
   docker restart odoo-web
   ```
3. **SQL Row-Count Parity Gate:** Verify every core and custom table row count on the target database matches the source baseline 100%.
4. **Frontend Cutover:** Update `ODOO_BASE_URL` and `ODOO_DB` in the Next.js `.env` file and verify login, multi-company switching, and table queries.

### 6. Safe Decommissioning & Disk Reclamation
- Keep the source Odoo stack running untouched during fases 1–4 as an instant rollback target.
- After target verification and a stabilization window, back up the final `.dump` to `/opt/data/backups/`, bring down the source stack (`docker compose down`), remove `odoo` and `postgres` images (`docker rmi`), and delete the old runtime data directories to reclaim ~3.7 GB disk and ~1.2 GB RAM.

## Pitfalls & Guardrails
- **Database Rename Orphans Filestore:** Restoring `odoo_dev` into `syailendra_erp` without renaming `/var/lib/odoo/filestore/odoo_dev` to `/var/lib/odoo/filestore/syailendra_erp` causes `FileNotFoundError` on every binary attachment and logo. Always rename the filestore folder to match the target database name.
- **Missing `proxy_mode = True` Behind Caddy/Cloudflare:** Omitting `proxy_mode = True` causes Odoo to generate `http://` redirect URLs behind TLS termination, triggering mixed-content blocks and infinite login redirect loops.
- **Pre-Existing Cloudflare Proxy/Tunnel Collisions:** Before cutting over a subdomain (e.g. `odoo.<domain>`), check `getent hosts` and `curl -sI` to verify whether Cloudflare DNS or an active Zero Trust Tunnel already routes that hostname to another server or Odoo version.
- **Planning Turn Non-Interference:** When the user asks for a migration or phase plan ("buat plan ... jangan membuat perubahan apapun untuk saat ini"), perform only read-only inspections and inter-profile coordination; never create directories, edit configs, or restart containers until explicit approval is granted.
