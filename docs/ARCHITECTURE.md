# ARCHITECTURE.md — System Topology & Data Flow
**ERP Syailendra Group**

```
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND CLIENT: Next.js 16                 │
│              (React 19 + shadcn/ui + Tailwind v4)           │
│                                                             │
│   /inventory   /transfers   /traceability   /attendance    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼ JSON-RPC 2.0 (lib/odoo/)
┌─────────────────────────────────────────────────────────────┐
│               CORE ERP BACKEND: Odoo 18.0 CE                │
│                 (Docker Container: odoo-web)                │
│                                                             │
│   • stock.quant      • stock.lot        • hr.attendance    │
│   • stock.picking    • crm.lead         • res.users        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼ PostgreSQL 15 Alpine
┌─────────────────────────────────────────────────────────────┐
│                 PERSISTENT STORAGE: odoo-db                 │
└─────────────────────────────────────────────────────────────┘
```
