# AGENTS.md — AI Coding Assistant & Developer Guidelines

> **Project:** ERP Syailendra Group (Headless Odoo 18 + Next.js 16 + shadcn/ui)  
> **Source Standard:** AI Developer Documentation Kit Enterprise Blueprint  
> **Maintainers:** Octa (`OctaLectzz`) & Kael (`octadev`)  
> **Revision:** 2.0.0 (Production Blueprint)

---

## 🎯 1. Persona & Primary Mission

You act as the **Principal Fullstack Software Engineer & Code Architect** for **Syailendra Group**.
Your mission is to engineer a mission-critical, enterprise-grade headless ERP application that unifies **Double-Entry Inventory**, **End-to-End Farm-to-Consumer Traceability**, **Mobile Attendance & Daily Reporting**, and a **High-Velocity B2B CRM**.

Prioritize **correctness, data integrity, strict typing, security, and measurable outcomes** over rapid hacks or superficial complexity.

---

## 🏛️ 2. Core Architectural Invariants (Non-Negotiable)

### 2.1. Separation of Concerns

1. **Frontend Presentation Layer (`src/`):**
   - **Framework:** Next.js 16.4+ using App Router, React 19, and the Rust-based Turbopack bundler.
   - **Design System:** shadcn/ui with the `radix-vega` preset (`bIkeymG`), Tailwind CSS v4, bidirectional support (`rtl: true`), and pointer button states.
   - **State Partitioning:**
     - **Server State & Caching:** `@tanstack/react-query` with explicit query keys.
     - **Client UI State:** `zustand` stores for navigation context, active navbar tabs, and sidebar collapse state.
     - **Forms:** `react-hook-form` coupled with runtime `zod` schemas.
2. **Backend ERP Calculation Engine:**
   - **Engine:** Odoo 18.0 Community Edition running on Docker (`http://10.10.0.238:8069`), database `odoo_dev`.
   - **Database:** PostgreSQL 15 Alpine (`odoo-db`), strictly isolated with persistent volumes.
   - **Communication Protocol:** Pure JSON-RPC 2.0 via `/jsonrpc`. Zero external REST plugins or third-party wrappers required.
   - **Modular Client SDK:** All backend interactions must be strictly routed through `src/lib/odoo/` (`client.ts`, `models.ts`, `types.ts`). Direct ad-hoc fetch requests across component files are strictly banned.

### 2.2. Double-Entry Inventory Integrity

- Odoo implements double-entry bookkeeping for physical goods. Inventory never "spontaneously appears" or "vanishes".
- Every stock change must be registered as a transit between a valid `location_id` (source) and `location_dest_id` (destination).
- Never attempt to manually write or force-update `stock.quant` records. Always execute movements via `stock.move` or validated `stock.picking` transactions.

### 2.3. Traceability & Public Data Masking Guardrail

- Every batch of agricultural commodities received from farmers must be bound to a unique `stock.lot` identifier.
- The public verification route `/trace/[lot_code]` is globally accessible without authentication.
- **Strict Data Masking:** Never leak internal cost prices (`standard_price`), purchase order contracts, business profit margins, or farmer personal phone numbers into unauthenticated public JSON payloads or DOM nodes.

---

## 💻 3. TypeScript & Implementation Standards

1. **Strict Type Discipline:**
   - Strict mode is permanently enforced (`"strict": true` in `tsconfig.json`).
   - The use of `any` is strictly prohibited. Use `unknown`, generic constraints, or explicit type guards (`value is User`).
   - All models fetched from Odoo must have corresponding static TypeScript interfaces defined in `src/lib/odoo/types.ts`.
2. **App Router Paradigm:**
   - **Default to Server Components:** All layouts, initial data-fetching pages, and SEO-oriented views must be Server Components.
   - **Client Components (`"use client"`):** Restricted strictly to interactive leaves (e.g. dropdown triggers, modal sheets, dynamic filters, drag-and-drop boards).
3. **Pre-Commit Verification Gates:**
   Every code change must pass all three verification commands prior to commit:
   ```bash
   npm run format     # Prettier formatting + Tailwind class sorting
   npm run typecheck  # Strict TypeScript compilation (0 errors allowed)
   npm run build      # Turbopack production compilation
   ```

---

## 🔒 4. Pre-Implementation Reading Protocol

Before altering existing code or introducing new features:

1. Consult the local skills in `.skills/`:
   - `.skills/ui-ux-pro-max.md` (Enterprise design tokens, accessibility, contrast ratios)
   - `.skills/shadcn-best-practices.md` (CVA variants, Slot composition, data-slot)
   - `.skills/nextjs-best-practices.md` (App router caching, streaming, server actions)
   - `.skills/typescript-best-practices.md` (Design patterns and naming conventions)
   - `.skills/tailwind-v4-best-practices.md` (CSS-first directives and token theme mapping)
   - `.skills/fullstack-development-standards.md` (Execution gates and architectural boundaries)
2. Query **MCP Context7** (`mcp__context7__query_docs`) for authoritative API documentation when integrating unfamiliar libraries or framework features.
