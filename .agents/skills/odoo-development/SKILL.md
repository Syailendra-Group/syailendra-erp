---
name: odoo-development
description: Use when deploying, configuring, or debugging Odoo ERP.
version: 1.6.0
author: Octa Hub
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags: [odoo, erp, python, postgresql, docker, orm, web-library, backend]
    category: devops
    requires_toolsets: [terminal]
---

# Odoo Development & Deployment

Manage the lifecycle of Odoo ERP systems: Docker composition, PostgreSQL integration, system configuration, database bootstrapping, and common operational pitfalls.

## When to Use

- Deploying Odoo Community or Enterprise on Docker
- Configuring `odoo.conf` and database connection parameters
- Troubleshooting database creation errors ("Access Denied", "DatabaseExists")
- Debugging reverse proxy issues (HTTPS redirect loops, truncated URLs)
- Setting memory limits and multi-threading parameters for Odoo instances
- Building headless frontend apps (Next.js/React) connecting via JSON-RPC 2.0 (`/jsonrpc`)
- Designing and implementing Farm-to-Consumer / Batch Traceability architectures (`stock.lot`, `stock.move.line`, `mrp.production`)
- Overcoming Odoo Community Edition limitations (e.g. absent `quality_control` module) via warehouse routing and custom status gating
- Utilizing Odoo 18 JSONB `lot_properties` for dynamic agricultural and chemical test data
- Setting up VS Code Remote SSH + Docker dev workspaces for Odoo ecosystem projects
- Deploying browser-based code-server (VS Code Web) on subdomains with reverse proxy ingress
- Upgrading Odoo major versions (e.g. v17 to v18) on Docker
- Installing and bootstrapping core business modules via CLI (`stock`, `mrp`, `purchase`, `crm`, `hr_attendance`)
- Enabling traceability configuration parameters (`stock.group_stock_production_lot`)
- Creating trackable products (`is_storable = True`, `tracking = 'lot'`) and managing inventory transfers
- Structuring modular TypeScript clients (`src/lib/odoo/types.ts`, `client.ts`, `models.ts`, `index.ts`)
- Establishing project standards (Prettier with Tailwind plugin, AGENTS.md, RULES.md, PRD.md, ARCHITECTURE.md, DESIGN.md)
- Adopting and adapting reference admin dashboard architectures (e.g. `satnaing/shadcn-admin`) into Next.js App Router projects while preserving user design presets
- Auditing and querying dynamic company identity (`res.company`) and role-based permissions (`res.groups`, `res.users`) for adaptive frontend navigation
- Adopting AI Developer Documentation Kit standards (AGENTS.md, PRD, ARCHITECTURE, DESIGN, SECURITY, TESTING, DEPLOYMENT, TASK_INSTRUCTION, RULES) in headless ERP repos
- Implementing dual-mode theming (default Light) via `next-themes` and modular bilingual internationalization (default Bahasa Indonesia) via `next-intl` in `/src/providers/` and `/src/messages/`
- Enforcing all-in-one pre-commit verification gates (`tsc --noEmit`, `eslint`, `prettier --check`) with zero warnings or errors

## Core Architecture & Stack Conventions

| Layer | Implementation | Notes |
| :--- | :--- | :--- |
| **Backend / Framework** | Odoo 18.0+ / 17.0+ (Python 3.12 / 3.10) | Werkzeug HTTP server, standard ORM recordset paradigm |
| **Database** | PostgreSQL 15/16 (Alpine) | Strict role separation, isolated data volumes |
| **Reverse Proxy** | Caddy / Nginx | Forward `X-Forwarded-Host`, `X-Forwarded-Proto`, `X-Real-IP`; enable `proxy_mode = True` in `odoo.conf` |
| **Execution Mode** | `workers = 0` (Dev multithreaded) | Multiprocessing (`workers > 0`) spawns memory-heavy forks (~300–500MB per worker); keep 0 in dev sandbox |

---

## Standard Docker Compose Setup

When setting up Odoo via Docker Compose on VPS environments:

```yaml
services:
  db:
    image: postgres:15-alpine
    container_name: odoo-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: odoo
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - /opt/octa/data/odoo-db:/var/lib/postgresql/data/pgdata
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U odoo -d postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 384M
        reservations:
          memory: 128M

  web:
    image: odoo:18.0
    container_name: odoo-web
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      HOST: db
      USER: odoo
      PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "8069:8069"
    volumes:
      - /opt/octa/data/odoo/web:/var/lib/odoo
      - /opt/octa/data/odoo/addons:/mnt/extra-addons
      - /opt/octa/data/odoo/config/odoo.conf:/etc/odoo/odoo.conf:ro
    deploy:
      resources:
        limits:
          cpus: "1.5"
          memory: 1200M
        reservations:
          memory: 512M
    logging:
      driver: "json-file"
      options:
        max-size: "20m"
        max-file: "3"
```

---

## Headless Architecture & JSON-RPC 2.0 Integration

When building custom web/mobile frontends (Next.js, React, Flutter) on top of Odoo:
- **Zero Custom Addons:** Communicate directly with Odoo via `/jsonrpc` endpoint using standard JSON-RPC 2.0.
- **Cross-Version API Stability:** Odoo's JSON-RPC 2.0 wire protocol (`/jsonrpc` with `service: "common"`, `method: "authenticate"` and `service: "object"`, `method: "execute_kw"`) is completely forward-compatible across major versions (v16, v17, v18, and newer). Core inventory models (`product.product`, `stock.quant`, `stock.picking`, `stock.move.line`, `stock.lot`) and methods (`search_read`, `button_validate`) maintain identical method signatures. A custom headless TypeScript client written for v17 operates seamlessly against v18+.
- **Internal Docker Network Communication:** Attach the frontend container to the same external Docker network as Odoo (`octa-hub`). Query `http://odoo-web:8069/jsonrpc` directly. This eliminates public round-trip latency, avoids CORS overhead, and prevents exposing raw RPC ports to the internet.
- **Session & Auth Flow:** Authenticate once against `service: "common"`, `method: "authenticate"`, receive the `uid`, and reuse it across `service: "object"`, `method: "execute_kw"` calls via server-side session caching.
- **Dynamic Company Identity (`res.company`):** Query `res.company` fields (`name`, `logo`, `email`, `phone`, `street`, `city`, `website`, `report_header`, `report_footer`) to drive dynamic branding, headers, footers, and metadata across the frontend. Store custom application settings in `ir.config_parameter`.
- **Role-Based Navigation Filtering (`res.users` & `res.groups`):** Read the active user's assigned `groups_id` to dynamically filter navbar tabs (Inventory, CRM, Attendance, Settings) and sidebar submenus. Never store ephemeral UI state (e.g. active tab index or sidebar collapse) in Odoo; manage visual state via client React state, URL query parameters, or browser cookies to maintain 0ms UI responsiveness.
- See `references/jsonrpc_contracts.md` for typed JSON-RPC envelopes, authentication flows, and ORM query recipes.
- See `references/custom_addons_workflow.md` for custom addons scaffolding in Docker, permissions (`100:101`), CLI installation (`--no-http`), and regional hierarchy data models (`syailendra_region`).
- See `references/traceability_genealogy_spec.md` for multi-tier batch genealogy architecture (`stock.lot`, `mrp.production`), QC gating, and public QR projection rules.

---

## Traceability & Supply Chain Genealogy Design

When designing multi-tier agricultural/distillation traceability systems (e.g. Essential Oils, Commodities):
- **Full Chain Silsilah (7-Layer Lineage Architecture):**
  1. `Farmer ID` (`FMR-[WIL]-[SEQ]`) ➔ `res.partner` (is_company=False, vat=NIK, partner_latitude/longitude).
  2. `Harvest Lot` (`HAR-[WIL]-[YYYY]-[SEQ]`) ➔ `stock.lot` (plantation harvest lot).
  3. `Distillation Batch` (`DSTB-[YYYY]-[MM]-[SEQ]`) ➔ `mrp.workcenter` (boiler unit) + `mrp.production` (distillation run).
  4. `Raw Material Batch` (`RM-[MAT]-[YYYY]-[SEQ]`) ➔ `stock.lot` (inbound released oil drum).
  5. `Production Batch` (`PROD-[YYYY]-[SEQ]`) ➔ `mrp.production` (blending / formulation batch).
  6. `Finish Good Batch` (`FG-[PROD]-[YYYY]-[SEQ]`) ➔ `stock.lot` (packaged retail/wholesale product, multi-SKU 1ml/5ml/bottle/drum).
  7. `Shipment Manifest` (`SHIP-[YYYY]-[MM]-[SEQ]`) ➔ `stock.picking` (Outgoing delivery with `carrier_tracking_ref` FedEx AWB).
- **Public vs Internal Data Isolation (Zero Leakage):**
  - Public consumer QR scan routes (`/trace/[lot_code]`) MUST strictly filter out internal commercial/cost fields (`standard_price`, vendor purchase prices, internal margins, confidential production yield formulas) at the Next.js Server Action / API layer before rendering. Never forward raw ORM records directly to client components.
- **QC 3-Tier Status Gating without Enterprise Modules:**
  - Odoo Community Edition does not include `quality_control`. Solve this via **Warehouse Routing**:
    1. Set Inbound Receipt destination to `WH/Input/Quarantine` (`stock.location`).
    2. Set Manufacturing BOM raw material source location exclusively to `WH/Stock/Approved`.
    3. Because inbound stock resides in `Quarantine`, Odoo ORM naturally rejects reservation for production (`Physical & Logical Lockout`).
    4. Upon QC Green release, a Server Action generates an internal transfer (`stock.picking`) from `WH/Input/Quarantine` to `WH/Stock/Approved` and assigns the official `RM` batch number.
    5. Rejected lots (`red_rejected`) route to `WH/Reject` for vendor return claims.
- **Odoo 18 Dynamic Properties (`lot_properties` JSONB):**
  - Store botanical attributes (INCI name, plant part, distillation method) and lab test parameters (specific gravity, refractive index, GC-MS active compound percentages, COA link) inside `stock_lot.lot_properties` (native JSONB column). This avoids writing brittle custom PostgreSQL schema migrations for industry-specific attributes.
- **COA & Batch Number Strict Consistency:**
  - Export and delivery documents (COA, MSDS, Packing List, Invoice, AWB) MUST match the exact physical `stock.lot` picked. Any lot mismatch in downstream documentation invalidates international customs clearance.
- **Syailendra SOP Standards & SLA Rules:**
  - *Inbound Unboxing & Three-Way Match:* Essential oils require uncut video and 4-side photos; Finance enforces three-way match (`PO == GRN Accepted == Invoice`).
  - *B2B Sample Policy:* Maximum 3 free variants (1ml for precious/expensive oils like Gaharu, 5ml for regular oils like Patchouli/Citronella); 4th+ variant charged; 100% shipping fee paid by customer before dispatch.
  - *Mock Recall SLA:* Full backward genealogy trace from `FG` to `FMR` must complete in < 30 minutes (digital target < 30 seconds).
  - *Clean & Clear Hard-Gate:* `NO CHECK = NO SHIPMENT` for global export orders via FedEx.

---

## Remote Development Workflow (VS Code Remote SSH + Docker & code-server)

When hosting project workspaces on the VPS:
- **Host Workspace Hierarchy:** Maintain `/opt/octa/workspace/<project-name>` per project.
- **Bind Mount for HMR:** Mount the workspace directory into the runtime container (e.g., `node:20-alpine`) so that Hot Module Replacement (HMR) reflects code edits immediately in VS Code.
- **Automatic Port Forwarding:** VS Code Remote - SSH automatically forwards port `3000` to `localhost:3000` on the developer's client machine.
- **Browser-based code-server Deployment:**
  - Image: `codercom/code-server:latest`, exposed port `8443:8080` (host 8443 -> container 8080).
  - Mount `/opt/octa/workspace` ➔ `/home/coder/project`, persistent settings `/opt/octa/data/code-server` ➔ `/home/coder/.local/share/code-server`, and persistent config `/opt/octa/data/code-server-config` ➔ `/home/coder/.config/code-server`.
  - **Persistent Node.js Runtime:** Extract Node.js Active LTS (Node 22.x LTS "Jod", e.g. `v22.23.4`) to a host directory (`/opt/octa/data/node-lts`) and mount it read-only to `/opt/node:ro` in container with `PATH: /opt/node/bin:$PATH`. This prevents Node/npm from being wiped whenever the container is updated or recreated.
  - Set ownership: `chown -R 1000:1000 /opt/octa/data/code-server /opt/octa/workspace /home/coder/.config` so the `coder` user has write permissions for tool caches.
  - Require password protection: `PASSWORD=<secret>` in container env.
  - Reverse proxy / Web Ingress: Mandatory WebSocket support (`ws`/`wss`) in Caddy/Nginx, or the web editor and integrated terminal will repeatedly disconnect.
  - **Memory Allocation for Scaffolding:** Set `limits.memory: 1536M` (1.5 GB). Project generators (`create-next-app`, `shadcn init`) briefly peak at ~1.2 GB RAM during tarball decompression; setting lower limits (e.g. 768M) triggers Linux OOM killer (`exit code 137`).
- **Package Manager & Scaffolding Pacing:**
  - Default to standard `npm` for project initialization, scripting, and dependency management unless the user explicitly requests an alternative.
  - Do NOT jump directly into generating boilerplate code before aligning wireframes, scope, and technical stack with the user.
  - Always consult MCP Context7 (`mcp__context7__resolve_library_id` and `mcp__context7__query_docs`) to verify latest LTS versions and library syntax (e.g. Next.js, shadcn/ui, TanStack Table) before running generators.
- **Reference Layout Study & Adaptation Rule:**
  - When the user asks to study an external dashboard repository (e.g. `satnaing/shadcn-admin` with Vite/React SPA):
    1. Clone/inspect into an isolated scratch cache (`$TMPDIR` / scratch), NEVER touch the active project files.
    2. Analyze the structural primitives (`AppSidebar`, `SidebarProvider`, `Header`, `NavGroup`, `NavUser`, `Main`).
    3. Translate SPA concepts (TanStack Router `<Outlet />`, client cookies) into Next.js App Router equivalents (`{children}` in layout, Server Component cookies).
    4. Explicitly preserve the project's existing styling preset (e.g. `radix-vega` / Tailwind v4) instead of overwriting with the reference repo's theme.
    5. Keep the active git working tree 100% clean during the study phase.
- **Resource Capping:** Cap frontend dev containers (`limits.memory: 1024M`, `limits.cpus: "1.5"`) to preserve headroom for core services (Hermes, n8n, Postgres). Stop idle project stacks (`docker compose stop`) to reclaim memory.

---

## Critical Pitfalls & Operational Rules

| Issue / Symptom | Root Cause | Preventive Rule & Remediation |
| :--- | :--- | :--- |
| **"Access Denied" on `/web/database/create`** | The "Master Password" form field at the top was filled with user/Google-saved password instead of `admin_passwd` | The Master Password controls database management RPC operations (`check_super`), not user accounts. Input MUST match `admin_passwd` in `odoo.conf`. Never let browser auto-fill overwrite this field. |
| **"Internal Server Error" on redirect after DB creation** | Database bootstrap takes 20–60s; mobile browser re-submits form or truncates URL (`/w` instead of `/web`) | Odoo raises `DatabaseExists` when a duplicate creation POST arrives for an already generated DB. Check `docker exec odoo-db psql -U odoo -d postgres -c '\l'` to verify if the DB already exists. If it exists, navigate directly to `/web/login`. |
| **Volume Permission Denied (EACCES / Errno 13)** | UID mismatch: official Odoo 17 runs as UID `101:101`, but official Odoo 18 runs as UID `100:101` (`uid=100(odoo) gid=101(odoo)`); PostgreSQL Alpine runs as UID `70:70` | For Odoo 17, `chown -R 101:101 <odoo_mounts>`. For Odoo 18+, **`chown -R 100:101 <odoo_mounts>`** (specifically `/opt/octa/data/odoo/web` and `addons`). Always verify container user via `docker run --rm <image> id`. Failure to match UID causes `PermissionError: [Errno 13] Permission denied: '/var/lib/odoo/sessions'` and HTTP 500 on database selectors. |
| **Odoo 18 Storable Product & Quant Generation (`is_storable`)** | In Odoo 18, `type: 'consu'` no longer automatically tracks stock quantities; setting `is_storable = False` generates move lines without generating `stock.quant` records | Always set **`is_storable: True`** together with **`tracking: 'lot'`** at initial creation of `product.template`. Once inventory moves exist, Odoo ORM forbids altering tracking attributes (`UserError: You can not change the inventory tracking of a product that was already used`). |
| **Multi-Company Incompatible Locations (`action_confirm` Error)** | Creating `stock.picking` with locations from a different company causes `UserError: Incompatible companies on records` | When creating a picking programmatically, always inspect the `company_id`, `default_location_src_id`, and `default_location_dest_id` of the target `stock.picking.type` first, and explicitly assign the matching `company_id` to the picking and its child moves. |
| **CLI Module Installation Port Collision (`[Errno 98] Address already in use`)** | Running `docker exec <container> odoo -i <modules> --stop-after-init` while Odoo server daemon is already running causes the new process to attempt binding port 8069 | Always pass **`--no-http`** when installing or upgrading modules via CLI inside a running container: `docker exec odoo-web odoo -c /etc/odoo/odoo.conf -d <dbname> -i <modules> --no-http --stop-after-init`. |
| **Traceability & Lot Features Not Appearing** | Installing `stock` alone leaves Lot/Serial tracking disabled in global config settings | Enable lot and multi-location groups by inserting parameters directly into database: `INSERT INTO ir_config_parameter (key, value) VALUES ('stock.group_stock_production_lot', 'True'), ('stock.group_stock_tracking_lot', 'True'), ('stock.group_stock_multi_locations', 'True') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`. |
| **Major Version Upgrade Schema Mismatch** | Major Odoo version upgrades (e.g. v17 to v18) cannot mount an existing database volume from an older major version without OpenUpgrade scripts | In dev/sandbox setups, always clean filestore and postgres data volumes (`rm -rf <data_dir>/*`) when changing `ODOO_VERSION` in Docker compose to allow clean database bootstrap. |
| **Host Disk Saturation during Odoo Image Pull** | Odoo Docker images are ~2.75 GB uncompressed; pulling a new major image while older images remain can push host disk usage past safety thresholds | Before pulling a new Odoo image on constrained VPS nodes, audit `df -h /` and run `docker image prune -a --filter "until=24h"` to reclaim inactive layers, keeping >= 12 GB free headroom. |
| **Host OOM / RAM Exhaustion** | Odoo ORM loads large registry bundles into memory; multiple worker forks multiply memory linearly | Always enforce Docker memory limits (`limits.memory: 1200M`) and set `workers = 0` in `odoo.conf` for non-production/learning instances. |
| **Session / CSRF Loop on HTTPS** | Odoo does not recognize reverse proxy HTTPS scheme | Ensure `proxy_mode = True` is declared in `odoo.conf` and reverse proxy passes standard `X-Forwarded-Proto: https` and `X-Forwarded-Host` headers. |
| **code-server Terminal Disconnects** | Reverse proxy does not support or proxy WebSockets | Ensure reverse proxy / Web Ingress forwards WebSocket headers (`Upgrade: websocket`, `Connection: Upgrade`) for code-server domain. |
| **`code-server` Permission Denied on `.config` (EACCES)** | Mounting subpaths into `/home/coder/.config` while parent directory is root-owned prevents tools (e.g. `create-next-app`) from writing | Run `chown -R 1000:1000 /home/coder/.config /home/coder/.cache` inside container so the `coder` user owns the entire configuration tree. |
| **Missing Node/npm in `code-server`** | `codercom/code-server:latest` bundles Git but lacks Node.js/npm; installing inside ephemeral root gets wiped on recreate | Extract official Node.js Active LTS `.tar.gz` (Node 22.x LTS "Jod", e.g. `v22.23.4`; avoid `.tar.xz` as `xz` is missing in minimal Debian) into host `/opt/octa/data/node-lts`, mount read-only into `/opt/node:ro`, and prepend `/opt/node/bin` to `PATH`. Avoid bleeding-edge Node 24 due to `minipass-flush` `TypeError` with npm. |
| **Container OOM Killer (`exit code 137`) during Scaffolding** | `create-next-app` and `shadcn init` peak at ~1.2 GB RAM during tarball decompression | Allocate at least `limits.memory: 1536M` (1.5 GB) to `code-server` in `compose.yaml`. |
| **Two-Step Scaffolding for shadcn with `--src-dir`** | Running `shadcn init --name <dir>` directly may place components in root `app/` instead of `src/` | First scaffold Next.js via `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes`, then run `npx shadcn@latest init --preset <name> --base radix --template next --rtl --pointer --yes` inside that folder; shadcn will auto-detect the existing `src/` tree and configure `src/components/ui/` seamlessly. |
| **Next.js 16 Turbopack Prerender Failure with `cacheComponents`** | Legacy route configs (`revalidate = 0`, `dynamic = "force-dynamic"`) are rejected by Turbopack; uncached JSON-RPC fetches fail static generation | Do not use legacy segment configs in Next.js 16. Declare `export const instant = false;` to allow blocking dynamic rendering, or isolate uncached RPC calls inside `<Suspense>` boundaries. |
| **Odoo 18 `lot_properties` JSON-RPC Stripping Quirk** | In Odoo 18, `stock.lot.lot_properties` is a `fields.Properties(definition='product_id.lot_properties_definition')`; if property keys are not pre-registered on the product template, `search_read` returns `lot_properties: []` over JSON-RPC even if PostgreSQL contains the JSON data | Always mirror JSON metadata into `stock_lot.note`. In TypeScript clients, implement dual extraction: if `lot_properties` is a non-empty object, use it; otherwise fallback to `JSON.parse(lot.note.trim())`. `note` is plain text and never stripped by Odoo ORM. |
| **`product_template` NOT-NULL Column Constraints on Direct Seeders** | Direct SQL or raw ORM inserts into `product_template` in Odoo 18 fail with `NotNullViolation` on columns without DB defaults | Always supply: `service_tracking: 'no'`, `purchase_line_warn: 'no-message'`, `sale_line_warn: 'no-message'`, `type: 'consu'`, and `tracking: 'lot'`. In `stock_quant`, supply `reserved_quantity: 0.0` and `in_date: NOW()`. |
| **Premature Project Scaffolding & Tool Mismatch** | Jumping straight into running project generators (e.g. `create-next-app` via `pnpm`) before clarifying user package manager and architecture preferences causes rework | Always confirm the preferred package manager (default to standard `npm`) and pause scaffolding until wireframes/stack are agreed upon. Query MCP Context7 (`mcp__context7__resolve_library_id` and `mcp__context7__query_docs`) first to retrieve up-to-date documentation for target libraries before generating boilerplate. |
| **Storing Ephemeral UI State in Odoo Database** | Attempting to write active navbar tab indices, search inputs, or sidebar toggle states to Odoo backend tables creates excessive RPC overhead | Keep UI runtime state strictly in Next.js/React (URL search params, component state, or HTTP cookies). Odoo backend is strictly for business data, security groups (`res.groups`), and company master configuration (`res.company`). |
| **Unfiltered `unlink()` on `res.partner` or Master Records** | Mass-deleting `res.partner` records without excluding system singletons deletes OdooBot (ID 1), the active Administrator (ID 2), and company root partners, permanently destroying authentication and foreign key integrity | Always scope purge domain to non-system records (`[('id', 'not in', [1, 2]), ('user_ids', '=', False)]`), follow topological cascade order (child records before parents), and take a `pg_dump` snapshot before any mass purge. |

---

## Verification Checklist

1. **Verify Database Creation Status via PostgreSQL CLI:**
   ```bash
   docker exec odoo-db psql -U odoo -d postgres -c "\l"
   ```
2. **Check Odoo HTTP Redirect & Login Endpoint:**
   ```bash
   curl -I -s http://127.0.0.1:8069/web/login
   ```
   Must return `HTTP/1.0 200 OK` or `303 SEE OTHER` pointing to `/web/login`.
3. **Inspect Realtime Container Health & Memory Footprint:**
   ```bash
   docker stats --no-stream odoo-web odoo-db
   ```
