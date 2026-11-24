---
name: odoo-docker-provisioning
description: "Use when provisioning or migrating Odoo 18 Docker stacks."
version: 1.0.0
author: "Octa Hub"
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags:
      - odoo-18
      - docker-compose
      - container-uid
      - caddy-reverse-proxy
      - postgresql-backup
      - filestore-sync
      - zero-downtime
---

# Odoo 18 Docker Stack Provisioning, Cross-VPS Migration & Reverse Proxy Standard

## When to Use
Use when deploying a new Odoo 17/18/19 Docker Compose stack on a target VPS, migrating an active Odoo backend (PostgreSQL database, custom addons, and filestore) across servers, configuring Caddy/Nginx HTTPS reverse proxying for Odoo, or decommissioning an old Odoo stack to reclaim host disk and memory.

## Core Procedure

### 1. Pre-Flight Telemetry & Network Discovery
Before transferring data or configuring endpoints, inspect both source and target hosts:
1. **Hardware Headroom:** Verify target VPS available RAM (`free -h`, require `>= 1.5 GB` available) and disk space (`df -h /`, require `>= 10 GB` free).
2. **Private Subnet & Firewall Check:** Inspect network interfaces (`ip -4 addr show | grep inet`) on both VPS nodes. When both nodes reside on the same datacenter private LAN (e.g. `10.10.0.0/22`), use SSH/SCP over the private LAN IP for `pg_dump`/`rsync` transfers (`< 1 ms` latency, zero public bandwidth usage). Note that datacenter hypervisor switches may filter arbitrary raw TCP ports (`8069`) across LAN nodes even when ICMP/SSH/HTTP(80) are permitted; always test actual TCP port reachability with `nc -z -v -w 2 <lan_ip> <port>`.
3. **Database Inventory:** Audit installed custom modules (`SELECT name, state, latest_version FROM ir_module_module WHERE state = 'installed'`) and baseline table row counts (`res_company`, `res_partner`, `product_template`, and custom models) on the source database.

### 2. Target Stack Provisioning (`compose.yaml` & `odoo.conf`)
Create an isolated stack directory (`/opt/app/stacks/odoo`) and persistent data directories (`/opt/app/data/odoo/{addons,web,config}` and `/opt/app/data/odoo-db`):

- **Canonical `compose.yaml` Guardrails:**
  - Pin exact image tags matching the source major version (`odoo:18.0` and `postgres:15-alpine`) to avoid binary/collation incompatibilities during `pg_restore`.
  - Bind Odoo HTTP port strictly to loopback (`127.0.0.1:8069:8069`) and connect `odoo-web` to the reverse proxy network (`app-net`) — never expose port `8069` or `5432` directly on `0.0.0.0`.
  - Configure `depends_on` with `condition: service_healthy` using `pg_isready -U $${POSTGRES_USER:-odoo} -d $${POSTGRES_DB:-postgres}` (escape `$$` inside `CMD-SHELL` so Compose does not interpolate empty host vars).
  - Enforce resource limits (`odoo-web`: `1200M` RAM / `1.5` CPUs; `odoo-db`: `384M` RAM / `1.0` CPU) and log rotation (`max-size: 20m`, `max-file: 3`).

- **Production `odoo.conf` Tuning:**
  ```ini
  [options]
  admin_passwd = <strong-random-secret>
  db_host = db
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
  db_name = <target_db>
  ```
  *Note:* Always set `db_name = <target_db>` when `list_db = False` so `/web/login` and session endpoints automatically select the production database without requiring `?db=` query parameters.

### 3. Container UID/GID Ownership & Permissions (Critical Step)
Inspect the runtime user inside the official Debian-based Odoo container via `docker exec odoo-web id`:
- Official `odoo:18.0` runs as `uid=100(odoo) gid=101(odoo) groups=101(odoo)`.
- Official `postgres:15-alpine` runs as `uid=70(postgres) gid=70(postgres)`.

Apply exact ownership and permissions to bind-mounted host directories before starting or testing `odoo-web`:
```bash
chown -R 100:101 /opt/app/data/odoo
chmod -R 775 /opt/app/data/odoo
chown -R 70:70 /opt/app/data/odoo-db
```

### 4. Caddy Reverse Proxy Integration & Upstream Verification
Add the virtual host block to the target `Caddyfile`:
```caddyfile
odoo.example.com {
    reverse_proxy odoo-web:8069 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {http.request.header.X-Forwarded-For}
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
Verify internal upstream reachability directly from the Caddy container:
```bash
docker exec caddy wget -S -O /dev/null http://odoo-web:8069
```

### 5. Atomic Trio Migration (Addons + Filestore + Database)
1. **Sync Custom Addons:** Transfer the clean addon directory from the repository SSoT (purged of `__pycache__`) to `/opt/app/data/odoo/addons/`.
2. **Sync Filestore:** Archive and transfer `/opt/octa/data/odoo/web/filestore/<source_db>` to `/opt/app/data/odoo/web/filestore/<target_db>`. When renaming the database (e.g. from `odoo_dev` to `syailendra_erp`), rename the filestore subdirectory to match `<target_db>` exactly, otherwise attachments and company logos break.
3. **Dump & Restore Database (Orchestrator Dual-Pipe with Cold Snapshot):**
   When nodes do not share direct SSH keys (`Host key verification failed`), stream the dump to a permanent cold snapshot on the orchestrator first, then pipe it into the target container:
   ```bash
   # 1. Capture compressed cold backup from source VPS onto orchestrator vault
   ssh source-vps 'docker exec odoo-db pg_dump -Fc -U odoo -d <source_db>' > /opt/data/backups/<source_db>_pre_migration_$(date +%Y%m%d_%H%M%S).dump

   # 2. Create UTF8 target database and stream restore atomically
   ssh target-vps 'docker exec odoo-db createdb -U odoo -E UTF8 <target_db>'
   cat /opt/data/backups/<source_db>_pre_migration_*.dump | ssh target-vps 'docker exec -i odoo-db pg_restore --clean --if-exists --no-owner -U odoo -d <target_db>'
   ```

### 6. Post-Restore Parity Verification & Cutover
1. **Update System Parameters:** Update `web.base.url` in `ir_config_parameter` to the new HTTPS domain and set `web.base.url.freeze = True` so admin logins from internal IPs do not overwrite the public URL.
2. **Zero-Port-Collision Module Upgrade:**
   ```bash
   docker exec odoo-web odoo -c /etc/odoo/odoo.conf -d <target_db> -u <custom_addon> --http-port 8079 --stop-after-init
   docker restart odoo-web
   ```
3. **SQL Row-Count Parity Gate:** Verify every core and custom table row count on the target database matches the source baseline 100%.
4. **Frontend Cutover & Firewall-Whitelisted RPC Transport:**
   - Update `ODOO_BASE_URL` and `ODOO_DB` in the Next.js `.env.local` file (check both `.env` and `.env.local`) and verify login, multi-company switching, and table queries.
   - If the public subdomain (`odoo.<domain>`) is still proxied by Cloudflare to another server/tunnel and the datacenter hypervisor blocks raw port `8069` over the private LAN, bind the container port to the target VPS public IP (`<target_public_ip>:8069:8069`) and whitelist ONLY the frontend VPS public IP in UFW (`ufw allow from <frontend_public_ip> to any port 8069 proto tcp`).

## Pitfalls & Guardrails
- **Debian Odoo Container UID `100:101` vs `101:101` (HTTP 500 Crash):** Setting `/opt/app/data/odoo` ownership to `101:101` instead of `100:101` causes `PermissionError: [Errno 13] Permission denied: '/var/lib/odoo/sessions'` because the container's `odoo` user has `uid=100` and `gid=101` with default `0755` directory mode. Always set `chown -R 100:101` and `chmod -R 775` on `/opt/app/data/odoo`.
- **Database Rename Orphans Filestore:** Restoring `odoo_dev` into `syailendra_erp` without renaming `/var/lib/odoo/filestore/odoo_dev` to `/var/lib/odoo/filestore/syailendra_erp` causes `FileNotFoundError` on every binary attachment and logo. Always rename the filestore folder to match the target database name.
- **Missing `proxy_mode = True` Behind Caddy/Cloudflare:** Omitting `proxy_mode = True` causes Odoo to generate `http://` redirect URLs behind TLS termination, triggering mixed-content blocks and infinite login redirect loops.
- **Cloudflare Proxy / DNS A-Record Verification:** Before expecting Let's Encrypt HTTP-01 validation to succeed on a new subdomain (`odoo.<domain>`), check whether Cloudflare DNS resolves that subdomain to Cloudflare proxy IPs (`104.21.x.x` / `172.67.x.x`) or another tunnel rather than the target VPS IP. Test local Caddy-to-Odoo connectivity via `docker exec caddy wget -S http://odoo-web:8069` and JSON-RPC via `http://127.0.0.1:8069/jsonrpc` independent of external DNS propagation.
