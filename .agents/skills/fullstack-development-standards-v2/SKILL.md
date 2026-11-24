---
name: fullstack-development-standards-v2
description: Use when building fullstack Next.js, shadcn, or web apps.
version: 1.2.0
author: Octa Hub
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags: [fullstack, nextjs, react, shadcn, typescript, tailwind, zod, react-hook-form, recharts, tanstack-query, zustand, dnd-kit, tanstack-table, url-state]
    category: software-development
---

# Fullstack Development Standards (Next.js + shadcn/ui + TypeScript)

Defines the required engineering standards, preparation workflow, library stack, and pitfalls for modern fullstack web applications.

## When to Use

- Scaffolding or configuring new Next.js projects (App Router, Turbopack, React 19).
- Integrating UI component libraries (shadcn/ui, Radix UI primitives, Tailwind CSS v4).
- Setting up form handling, data tables, charting, and client state caching.
- Integrating external backend systems or ERP engines (Odoo, REST, JSON-RPC, GraphQL).
- Structuring modular client SDKs and typed ORM bridges.
- Applying code review rules, linting, formatting, and persistent project documentation.
- Adopting AI Developer Documentation Kit standards (AGENTS.md, PRD, ARCHITECTURE, DESIGN, SECURITY, TESTING, DEPLOYMENT, TASK_INSTRUCTION, RULES).

## Core Architecture & Universal Table Standards

### 1. Universal Table URL State (`useDataTableUrlState`)
Never write bespoke URL query parsing, pagination adapting, sorting parsing, or URL transition code inside individual table components.
- Centralize table state logic into `/src/hooks/use-data-table-url-state.ts`.
- Components provide: `defaultSort`, `defaultPerPage`, and `filterKeys`.
- The hook manages bi-directional synchronization with browser URL search parameters (`?page=1&status=active,archived&commodity=gaharu,serai`).
- Returns memoized TanStack Table state (`pagination`, `sorting`, `columnFilters`), Odoo order string (`orderOdoo`), and standard event handlers (`onPaginationChange`, `onSortingChange`, `onGlobalFilterChange`, `createColumnFiltersHandler`, `resetFilters`).
- Guarantees strict line limits (< 300 lines) by reducing table boilerplate by 100+ lines.

### 2. Pure Domain & Dynamic SSR Helpers (`/src/utils/`)
Keep `/src/lib/` strictly for third-party client wrappers and network transports (`/src/lib/odoo/client.ts`).
Pure computational helpers must reside in `/src/utils/`:
- `table-url.ts`: `parseArrayParam()`, `serializeArrayParam()`, `buildTableQueryString()`, and pagination ellipsis `getPageNumbers()`.
- `odoo-query.ts`: `buildPolishOrDomain()` for multi-value substring filtering and `buildStatusDomain()` for boolean status filtering.
- `ssr-config.ts`: `DYNAMIC_SSR_CONFIG` (`force-dynamic`, `revalidate: 0`, `force-no-store`) and cache tags for on-demand revalidation.

### 3. Server-Side Data Processing via Backend ORM
- For large operational datasets, always use backend windowing (`search_count` + `search_read` via Odoo ORM).
- Pass `manualPagination: true`, `manualFiltering: true`, and `manualSorting: true` to `useReactTable`.
- Combine with `<DataTableSkeleton />` displaying a subtle top pulse bar during active refetching or URL transition.

### 4. Zero `any` & Zero `unknown` Strict Type Safety
- Never use `any` or `unknown` in application hooks, component props, or type definitions.
- For polymorphic input handlers (such as global search), narrow to explicit unions: `val: string | number | boolean | null | undefined`.
- Centralize shared table and select interfaces in `/src/types/components/`.