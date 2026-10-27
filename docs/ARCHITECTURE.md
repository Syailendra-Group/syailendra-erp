# ARCHITECTURE.md — System Topology & Technical Specifications

> **Project:** ERP Syailendra Group  
> **Architecture Pattern:** Headless Decoupled ERP (Next.js 16 App Router + Odoo 18 ORM Engine)  
> **Maintainers:** Kael (`octadev`) & Atlas (`octainfra`)

---

## 🏛️ 1. Global System Topology

The system uses a decoupled, headless architecture where the presentation layer is isolated from the database and calculation engine:

```
┌────────────────────────────────────────────────────────────────────────┐
│             PRESENTATION LAYER: Next.js 16 (App Router)                │
│             - Host Port: 8443 (Reverse Proxied via Caddy)              │
│             - Runtime: Node.js 22 LTS (Active)                         │
│             - Styling: Tailwind CSS v4 + shadcn/ui (radix-vega)        │
│             - Caching & State: TanStack React Query + Zustand          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP POST JSON-RPC 2.0 (Zero-Latency)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             CORE ERP CALCULATION ENGINE: Odoo 18.0 CE                  │
│             - Container: odoo-web (Docker Network: octa-hub)           │
│             - Runtime: Python 3.12 + Werkzeug WSGI Server              │
│             - Port: 8069 (Internal HTTP, Public via odoo.octalectzz)   │
│             - Execution Mode: Single-Process Multithreaded (workers=0) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Unix Domain Socket / TCP Port 5432
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             RELATIONAL DATABASE: PostgreSQL 15 Alpine                  │
│             - Container: odoo-db (Isolated persistent volume)          │
│             - Database: odoo_dev                                       │
│             - Memory Limit: 384M Hard Cap                              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 2. Data Flow & Transport Protocols

### 2.1. Internal JSON-RPC 2.0 Contract

All backend transactions utilize Odoo's native `/jsonrpc` endpoint. No third-party REST API addons are installed, guaranteeing stability across standard Odoo updates.

```
Request Envelope:
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "service": "object" | "common",
    "method": "execute_kw" | "authenticate",
    "args": [...]
  },
  "id": <sequential_integer>
}

Response Envelope:
{
  "jsonrpc": "2.0",
  "id": <sequential_integer>,
  "result": <typed_payload>,
  "error": { "code": 200, "message": "Odoo Server Error", "data": {...} }
}
```

### 2.2. Session Lifecycle & Caching Strategy

1. **Authentication (`service: common`):**
   - Credentials (`ODOO_DB`, `ODOO_USERNAME`, `ODOO_PASSWORD`) are verified once.
   - The returned integer User ID (`uid`) is cached in memory by `OdooClient` in `src/lib/odoo/client.ts`.
2. **Execution (`service: object`):**
   - Subsequent calls invoke `execute_kw` using the cached `uid`, eliminating authentication latency for high-frequency queries.
3. **Resilience & Reconnect:**
   - If an RPC call returns a session invalidation exception, `OdooClient` automatically invalidates the cached `uid`, re-authenticates, and replays the original request.

---

## 🗄️ 3. Odoo Model Schema & Domain Mapping

| Business Domain          | Odoo 18 Model                         | Target ORM Method                | Primary Database Fields                                                             |
| :----------------------- | :------------------------------------ | :------------------------------- | :---------------------------------------------------------------------------------- |
| **Company Identity**     | `res.company`                         | `search_read`, `write`           | `name`, `logo`, `email`, `phone`, `street`, `city`, `website`, `report_header`      |
| **Product Catalog**      | `product.template`, `product.product` | `search_read`, `create`          | `name`, `list_price`, `standard_price`, `tracking`, `is_storable`, `description`    |
| **Physical Stock**       | `stock.quant`                         | `search_read`                    | `product_id`, `location_id`, `lot_id`, `quantity`, `reserved_quantity`              |
| **Warehouse Transfers**  | `stock.picking`                       | `search_read`, `button_validate` | `name`, `partner_id`, `picking_type_id`, `location_id`, `location_dest_id`, `state` |
| **Move Lines**           | `stock.move.line`                     | `search_read`, `write`           | `picking_id`, `product_id`, `lot_id`, `quantity`, `location_id`, `location_dest_id` |
| **Traceability Lots**    | `stock.lot`                           | `search_read`, `create`          | `name`, `product_id`, `ref`, `note`, `create_date`                                  |
| **Workforce Attendance** | `hr.attendance`                       | `search_read`, `create`, `write` | `employee_id`, `check_in`, `check_out`, `worked_hours`                              |
| **Commercial Leads**     | `crm.lead`, `crm.stage`               | `search_read`, `create`, `write` | `name`, `partner_id`, `expected_revenue`, `probability`, `stage_id`, `priority`     |

---

## 🔒 4. Security & Network Isolation

1. **Docker Network Confinement:**
   - Both `code-server`, `odoo-web`, and `odoo-db` reside on the internal bridge network `octa-hub`.
   - Next.js accesses Odoo directly over internal host IP `http://10.10.0.238:8069` without exposing RPC traffic to the public internet.
2. **Reverse Proxy Termination:**
   - Public traffic to `code.octalectzz.my.id` and `odoo.octalectzz.my.id` is terminated at Caddy with automated Let's Encrypt TLS/HTTPS certificates.
3. **CORS & CSRF Defenses:**
   - Since Next.js Server Components run server-to-server with Odoo, browser-side CORS limitations do not apply to data fetching.
   - Client Component form submissions run via Next.js Server Actions with built-in CSRF token protection.
