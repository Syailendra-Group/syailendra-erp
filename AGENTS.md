# AGENTS.md — System Rules & Engineering Conventions for AI & Developers
**Project:** ERP Syailendra Group (Headless Odoo 18 + Next.js 16 + shadcn/ui)  
**Maintained by:** Kael (`octadev`) & Octa (`OctaLectzz`)

---

## 🏛️ 1. Architecture Guardrails
1. **Separation of Concerns:**
   - **Frontend:** Next.js 16 (App Router), TypeScript strict mode, Tailwind CSS v4, shadcn/ui.
   - **Backend:** Odoo 18 Community Edition running on Docker (`http://10.10.0.238:8069`).
   - **Protocol:** Pure JSON-RPC 2.0 (`/jsonrpc`). No third-party REST API plugins needed.
2. **Zero Core Modification Rule:**
   - Never modify Odoo core code or database constraints directly outside supported ORM calls.
   - All state transitions (e.g. validating picking, creating lots) must go through `src/lib/odoo/`.

---

## 💻 2. Coding & Design Standards
1. **Next.js App Router Paradigm:**
   - Default to Server Components for data-fetching pages (`src/app/`).
   - Use Client Components (`"use client"`) strictly for interactive UI leaves (forms, modals, filter triggers).
2. **Formatting & Linting:**
   - Run `npm run format` (Prettier + Tailwind plugin) before committing.
   - Run `npm run typecheck` (`tsc --noEmit`) to verify zero TypeScript errors.
3. **Data Security & Public QR View:**
   - Under `/trace/[lot_code]`, never leak cost price (`standard_price`), vendor PO values, or customer phone numbers to unauthenticated viewers.
