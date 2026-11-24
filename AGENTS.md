# AGENTS.md — ERP Syailendra Group

> ## Verified current state (2026-11-23)
>
> A canonical, English documentation set now lives in `docs/agent/` and the agent
> workspace lives in `.agents/`. Where this file disagrees with them, they win.
>
> - Business: essential oils and natural commodities (DDistillers brand) for
>   Syailendra Group. The earlier "specialty Arabica coffee" description is obsolete.
> - Odoo backend: Odoo 18 Community Edition on the company host
>   (`ddistillers-vps`), database `syailendra_erp`. `odoo_dev` on the Dahono LXC is a
>   legacy/dev reference only.
> - Frontend: Next.js 16 App Router, TypeScript strict, shadcn/ui, Tailwind v4.
> - Deployment: self-hosted behind the Caddy edge proxy; the Vercel deployment was
>   cancelled. `app.syailendra.group` is served through the edge proxy.
> - Odoo RPC services live in `src/services/odoo/` (not `src/lib/odoo/`), server
>   actions in `src/actions/`, types in `src/types/`, schemas in `src/schemas/`.
> - Sections 13 (Features) and 16 (Environment Variables) below are historical
>   sprint notes; treat them as background, not as current state.
> - Never commit or push without explicit owner approval for that specific action.
>
> Read `docs/agent/README.md` first, then `.agents/AGENTS.md` and
> `.agents/rules/`.

---

## 1. Project Overview

- **Name** : ERP Syailendra Group (Headless Enterprise Management System)
- **Description** : A mission-critical, enterprise-grade headless ERP application that unifies Double-Entry Inventory, End-to-End Farm-to-Consumer Traceability, Workforce Attendance & Daily Reporting, and a High-Velocity B2B CRM (Colabo Style). Built with a decoupled architecture separating a modern Next.js 16 frontend from an Odoo 18 Community Edition calculation and ORM engine.
- **Goal** : To streamline the essential-oil and natural-commodity supply chain (DDistillers), ensure transparent batch traceability from partner farmers and distilleries to B2B buyers and retail consumers via QR Code, automate workforce tracking, and power B2B wholesale deals.
- **Target Users**: Superadmin / Executives, Warehouse Officers, QC & Agronomists, Sales Representatives, Field Operations, and Retail Consumers (via public QR).
- **Version** : v1.0.0-dev
- **Status** : Active development

---

## 2. Tech Stack

- **Language** : TypeScript (Strict Mode, Zero `any`)
- **Framework** : Next.js 16.4+ (App Router, Turbopack Bundler)
- **UI Library** : shadcn/ui (`radix-vega` preset `bIkeymG`, Radix UI primitives)
- **Styling** : Tailwind CSS v4 (CSS-first architecture, `@tailwindcss/postcss`)
- **Icons** : Lucide Icons (`lucide-react`)
- **State Management**: TanStack React Query v5 (Server/Cache State), Zustand (Client UI State)
- **Form Management** : React Hook Form + Zod (`@hookform/resolvers`)
- **Data Tables** : TanStack React Table v9 (Headless, multi-filter, virtualized)
- **Data Visualization**: Recharts (Analytics, trends, harvest metrics)
- **Backend ERP Engine**: Odoo 18.0 Community Edition (Docker on the company host `ddistillers-vps`, database `syailendra_erp`)
- **Database** : PostgreSQL (container `odoo-db` on the company host)
- **API Protocol** : Pure JSON-RPC 2.0 (`/jsonrpc` endpoint via internal Docker bridge `octa-hub`)
- **Package Manager** : npm (Strictly enforced)
- **Reverse Proxy** : Caddy (Automated TLS/HTTPS, Let's Encrypt)
- **Deployment** : Self-hosted behind the Caddy edge proxy (`app.syailendra.group`); the Vercel deployment was cancelled

---

## 3. Commands

```bash
# Development
npm run dev           # Start Next.js development server (Turbopack)
npm run build         # Build for production (Turbopack + TypeScript checks)
npm run start         # Start production build server
npm run lint          # Run ESLint (ESLint v9)
npm run format        # Format code using Prettier with tailwindcss plugin
npm run typecheck     # Validate strict TypeScript types without emitting files

# Package Management
npm install [package] # Install new package (NEVER use yarn, pnpm, or bun)

# Odoo backend (company host; local dev container is separate)
docker compose up -d  # Start Odoo 18 & PostgreSQL containers
docker compose ps     # Inspect container health and port bindings
docker compose logs   # Tail runtime logs for odoo-web and odoo-db
```

---

## 4. Project Structure

Architecture: Clean Modular Headless Architecture

```
[root]/
  .skills/             # Curated engineering guidelines (UI/UX, shadcn, Next.js, TS)
  docs/                # Project Documentation SSOT (PRD, ARCHITECTURE, DESIGN, etc.)
  public/              # Static assets (logos, illustrations, icons)
  src/
    app/               # Next.js App Router
      (dashboard)/     # Authenticated dashboard route group (Inventory, CRM, HR, Settings)
        layout.tsx     # App Shell: Sticky Topbar multi-tab + adaptive dynamic sidebar
        page.tsx       # Default redirect / executive overview
        inventory/     # Stock ledger, multi-warehouse monitoring, move history
        transfers/     # Incoming receipts, delivery orders, internal moves
        traceability/  # Agricultural lot lineage, batch generator, QC records
        attendance/    # Mobile clock-in/out, monthly worked hours recap
        reports/       # Daily afternoon work report submission & approval
        crm/           # B2B deal pipeline (Colabo Kanban drag-and-drop)
        settings/      # Company profile & role-based access matrix
      trace/           # Public Route: Dual-view QR code consumer verification
        [lot_code]/    # Dynamic public verification page (no login required)
      globals.css      # Tailwind CSS v4 variables & radix-vega theme tokens
      layout.tsx       # Root layout (fonts, providers, Sonner toaster)
    components/
      ui/              # shadcn/ui components (strictly here)
      layout/          # App Shell layout primitives (sidebar, header, nav-group, nav-user)
      shared/          # Reusable domain components (data tables, lot badges, stat cards)
      features/        # Feature-specific components
        inventory/     # Stock ledger table, transfer action dialogs
        traceability/  # Lot lineage tree, QR generator, farm origin cards
        crm/           # Colabo-style Kanban board, lead cards
        attendance/    # Digital clock card, GPS badge, report form
    lib/
      odoo/            # Modular Odoo 18 JSON-RPC SDK
        types.ts       # Strict TypeScript interfaces for Odoo models
        client.ts      # Core JSON-RPC 2.0 engine with session caching
        models.ts      # Domain services (Inventory, Traceability, HR, CRM)
        index.ts       # Unified gateway (export const odoo = { ... })
      utils.ts         # shadcn cn() helper (clsx + tailwind-merge)
    hooks/             # Custom React hooks (useOdooQuery, useDebounce, useMediaQuery)
    stores/            # Zustand global stores (useNavStore, useFilterStore)
    schemas/           # Zod validation schemas (transfers, lots, attendance, leads)
    types/             # Global application TypeScript declarations
```

File placement rules:

- New UI components from shadcn are always in `src/components/ui/`
- App Shell primitives reside strictly in `src/components/layout/`
- TypeScript interfaces for Odoo models belong in `src/types/`; RPC services live in `src/services/odoo/`
- Zod schemas are placed in `src/schemas/`
- Global Zustand stores are placed in `src/stores/`
- Do not create new top-level folders without prior confirmation.

---

## 5. Naming Conventions

```
# Files & Folders
- Components    : kebab-case    (e.g., stock-quant-table.tsx, lot-badge.tsx)
- Non-components: kebab-case    (e.g., use-odoo-query.ts, format-currency.ts)
- Folders       : kebab-case    (e.g., stock-ledger/, lot-traceability/)
- Pages         : page.tsx, layout.tsx, loading.tsx, error.tsx
- Route Groups  : (folder-name) (e.g., (dashboard)/)

# In-Code
- Variables     : camelCase     (e.g., stockData, isLoading, lotNumber)
- Constants     : UPPER_SNAKE   (e.g., MAX_RETRY, ODOO_BASE_URL)
- Functions     : camelCase     (e.g., getStockQuants, validateTransfer)
- Types/Interfaces: PascalCase  (e.g., StockQuant, StockPicking, HrAttendance)
- Enums         : PascalCase    (e.g., PickingState, LotTrackingType)
- CSS Classes   : kebab-case    (e.g., stock-badge, kanban-column)

# Git Branches
- Feature       : feat/[feature-name]
- Bug fix       : fix/[bug-name]
- Refactor      : refactor/[scope]
```

---

## 6. Code Conventions

```
# General Approach
- Apply clean code and DRY principles.
- Avoid duplication; extract to functions/components if used > 1 time.
- Write readable, maintainable English code (all variables/logic in English).
- NEVER hardcode UI text that might change; use centralized label dictionaries or Odoo dynamic data.

# TypeScript
- Use `strict: true` in tsconfig.
- NEVER use the 'any' type. Use unknown, generics, or type guards.
- Always explicitly write function return types for public service APIs.
- Use `interface` for object models, `type` for unions/intersections/primitives.

# Import Order
1. External libraries (React, Next.js, Lucide, Radix)
2. Absolute internals (@/components, @/lib, @/hooks, @/schemas)
3. Relative internals (./component, ../utils)
4. Types and Interfaces (import type { ... })
5. Assets and styles

# Export Pattern
- Use named exports for components and functions.
- Use default exports ONLY for `page.tsx` and `layout.tsx`.

# Error Handling
- Always use try-catch blocks for async RPC and Server Action executions.
- Do not leave caught errors unhandled; log informative error messages and return typed result objects.
```

---

## 7. Component Rules

```
# Component Structure Order
1. Imports (External first, internal absolute, relative, then types)
2. Types / Interfaces (Component Props definitions)
3. Component Definition (Main functional component)
4. Hooks (React Query, Zustand, useState, form hooks)
5. Handlers & Local Functions (Event handlers, derived calculations)
6. Return JSX (The UI rendering block)
7. Export (If not using inline named exports)

# Props Rules
- Always explicitly type component props using dedicated interfaces (e.g., StockTableProps).
- Provide default values for optional props.
- Mark immutable props as `readonly`.

# Server vs Client Components
- Default: Use Server Components for layouts, data fetching, and static UI.
- Use 'use client' ONLY IF needing:
    - useState / useEffect / custom hooks
    - Event listeners (onClick, onChange, onSubmit)
    - Browser APIs (window, navigator.geolocation, camera scan)
    - Client libraries (TanStack Table interactions, dnd-kit, framer-motion)
```

---

## 8. Styling Rules

```
# Styling Approach
- Use Tailwind CSS v4.
- NO inline styles unless the value is strictly dynamic (e.g., calculated progress bar width).
- NO `!important` unless overriding third-party injected styles.

# Tailwind CSS
- Use utility classes directly in JSX.
- Use `clsx` or `cn()` (from @/lib/utils) for conditional classes.
- Class order: layout > spacing > sizing > color > typography > interactive state.

# Responsive Design
- Mobile-first approach.
- Breakpoints: sm (640px) / md (768px) / lg (1024px) / xl (1280px).
- Touch target minimum: 44px x 44px on interactive mobile elements.

# Dark Mode & Design Tokens
- Default theme: Dark Mode (radix-vega enterprise slate palette).
- Use predefined CSS variables for colors (Primary, Secondary, Background).
- Do not hardcode raw hex codes inside components.
```

---

## 9. API & Data Fetching Rules

```
# Server vs Client Fetching
- Server fetch : Initial page load data, SEO metadata, public QR data.
- Client fetch : Dynamic tables, polling metrics, client search filters via TanStack Query.
- NEVER use `useEffect` for raw data fetching. ALWAYS use TanStack React Query or Server Components.

# Modular Odoo Client SDK
- Keep all Odoo RPC interactions strictly inside `src/services/odoo/`.
- Component files must never construct raw JSON-RPC payload objects directly.

# API Response Format
- Internal Server Actions must consistently return:
  `{ success: boolean, data: T | null, error?: string }`

# Environment
- Use `.env.local` for all backend connection parameters (ODOO_BASE_URL, ODOO_DB, credentials).
- Never commit `.env.local` into Git.
```

---

## 10. State Management Rules

```
# State Hierarchy
1. Local state (useState): Scoped strictly within 1 component (e.g. modal open state).
2. Form state (react-hook-form): Managed locally with Zod validation.
3. Server cache (@tanstack/react-query): Asynchronous Odoo data (stock lists, picking orders, leads).
4. Global UI state (zustand): Cross-cutting app state:
   - `useNavStore`: Active topbar tab ('inventory' | 'crm' | 'attendance' | 'settings'), sidebar collapse state.
   - `useUserStore`: Cached user session details and permissions matrix.

# Context usage
- Use React Context strictly for theme providers (next-themes) and QueryClientProvider.
- Do NOT use Context for frequently changing UI state.
```

---

## 11. Performance Rules

```
# Code Splitting & Lazy Loading
- Use dynamic imports (`next/dynamic`) for heavy interactive modules:
  - QR Code camera scanner (`html5-qrcode`)
  - Drag-and-drop Kanban board (`@dnd-kit`)
  - Chart analytics (`recharts`)

# Media & Assets
- Always use `next/image` for image rendering; define explicit width and height.
- Company logos and certificates should be optimized in WebP or SVG format.

# Re-render Optimization
- Use `useMemo` for heavy table filtering calculations if dataset > 500 rows.
- Use `useCallback` for functions passed as props to memoized table rows.
```

---

## 12. Git Rules

```
# Commit Message Format
feat     : [new feature description]
fix      : [bug fix description]
refactor : [refactor description]
style    : [styling/formatting changes]
docs     : [documentation updates]
test     : [adding/modifying tests]
chore    : [config/tooling changes]

# Rules
- NEVER commit `.env.local` or secret credentials.
- Keep one commit per logical unit of work.
- Pass all 3 verification gates (`format`, `typecheck`, `build`) before committing.

# Example
feat: implement dynamic navbar tabs and adaptive sidebar layout
fix: resolve lot quantity mismatch on delivery order validation
refactor: modularize odoo json-rpc domain services
```

---

## 13. Features

```
# Historical sprint notes (see docs/agent/ for current status)

# Completed
- [x] Scaffolding Next.js 16 with TypeScript and Turbopack
- [x] Setup Tailwind CSS v4 and shadcn/ui preset bIkeymG
- [x] Modular Odoo 18 JSON-RPC client SDK (types, client, models, index)
- [x] Odoo 18 backend verification (stock, purchase, mrp, crm, hr_attendance)
- [x] Integrate core libraries (zod, react-hook-form, recharts, react-query, react-table)
- [x] Adopt AI Developer Documentation Kit standards (AGENTS, PRD, ARCHITECTURE, DESIGN)

# In-Progress (Sprint 1)
- [ ] Build App Shell Layout: Sticky Topbar multi-tab + adaptive dynamic sidebar
- [ ] Integrate dynamic company branding from Odoo res.company

# Planned
- [ ] Module 1: Inventory & Stock Ledger DataTable
- [ ] Module 2: Farm-to-Consumer Traceability Tree & QR Code Dual-View
- [ ] Module 3: Mobile Attendance (Clock-In/Out) & Daily Work Reports
- [ ] Module 4: High-Velocity Commercial CRM (Colabo Kanban)
- [ ] Module 5: Enterprise Settings & RBAC Permissions Matrix
```

---

## 14. Testing

```
# Testing Strategy
- Pre-commit: `npm run format && npm run typecheck && npm run build`
- Unit Testing: Utility formatters, Zod schema resolvers, and lot code generators.
- Integration Testing: Odoo 18 JSON-RPC service calls against live test database.
- E2E Testing: Playwright (planned for transfer validation and clock-in flows).

# Coverage Target
- Business logic & Odoo SDK > Zod Schemas > UI Components.
```

---

## 15. Do Not

```
# Structure
- DO NOT create new root folders without confirmation.
- DO NOT delete or rename core files without confirmation.
- DO NOT modify the Odoo database schema or PostgreSQL tables directly.

# Code
- DO NOT use the 'any' type in TypeScript.
- DO NOT use inline styles for static values; use Tailwind classes.
- DO NOT write code logic, comments, or variable names in Indonesian; use professional English.
- DO NOT hardcode URLs, ports, or credentials; use environment variables.
- DO NOT install new packages with yarn, pnpm, or bun; strictly use npm.

# Prohibited Patterns
- DO NOT use useEffect for data fetching; use Server Components or React Query.
- DO NOT bypass double-entry inventory rules by manually updating stock.quant.
- DO NOT leak internal cost price (HPP), vendor PO, or profit margins on the public QR route `/trace/[lot_code]`.
- DO NOT expose Odoo master passwords or credentials to the client bundle.
```

---

## 16. Environment Variables

```
# Local Development (.env.local) - Gitignored
ODOO_BASE_URL="http://10.10.0.238:8069"
ODOO_DB="syailendra_erp"
ODOO_USERNAME="octalectzz@gmail.com"
ODOO_PASSWORD="***"

# Public Next.js Variables
NEXT_PUBLIC_APP_NAME="ERP Syailendra Group"
NEXT_PUBLIC_APP_URL="https://code.octalectzz.my.id"
```
