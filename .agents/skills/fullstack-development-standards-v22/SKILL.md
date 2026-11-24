---
name: fullstack-development-standards-v22
description: "Use when building fullstack Next.js, shadcn, or web apps."
version: 15.1.0
author: Octa Hub
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags: [fullstack, nextjs, react, shadcn, typescript, tailwind, zod, react-hook-form, recharts, tanstack-query, zustand, dnd-kit, tanstack-table, url-state, nextjs-clean-routes, leaflet-map-picker, ssr-safe-leaflet, dynamic-centroid-pan, cascading-regional-selector, non-numeric-section-titles, reusable-address-suite, hybrid-regional-forms, flattened-feature-folders, circular-barrel-prevention, textarea-mandate, sidebar-exact-matching, root-feature-index, centralized-crud-dispatcher, reusable-primary-action, direct-long-text-styling, semantic-tailwind-spacing, next16-proxy-standard, async-params-contract, git-safe-directory-contract, feature-controller-co-location, primary-action-onclick-mandate, dual-action-clipboard, throttled-batch-launcher, active-excel-hyperlink, reusable-datatable-component, canonical-table-order-standard, status-filter-key-alignment, four-file-feature-architecture, backward-compatible-columns-options, form-detail-inspection-standard, multi-file-form-colocation, universal-view-detail-dialog, semantic-non-changelog-commenting, pageheader-integrated-back-button, dedicated-form-top-actions, action-dialog-colocation-dialogs, pre-overhaul-preparation-protocol, skills-cli-expansion-contract, split-styles-brand-tokens, cloudflare-turnstile-nextjs, search-unindex-hardening, multi-entity-architecture, route-groups-clean-urls, proxy-ts-convention, metadata-title-hygiene]
    category: software-development
---

# Fullstack Development Standards (Next.js + shadcn/ui + TypeScript)

Defines the required engineering standards, preparation workflow, library stack, and pitfalls for modern fullstack web applications.

## When to Use

- Scaffolding or configuring new Next.js projects (App Router, Turbopack, React 19).
- Integrating UI component libraries (shadcn/ui, Radix UI primitives, Tailwind CSS v4).
- Setting up form handling, data tables, charting, and client state caching.
- Integrating interactive maps (Leaflet 2D, coordinates picking, GPS geolocation).
- Integrating external backend systems or ERP engines (Odoo, REST, JSON-RPC, GraphQL).
- Structuring modular client SDKs and typed ORM bridges.
- Applying code review rules, linting, formatting, and persistent project documentation.
- Adopting AI Developer Documentation Kit standards (AGENTS.md, PRD, ARCHITECTURE, DESIGN, SECURITY, TESTING, DEPLOYMENT, TASK_INSTRUCTION, RULES).
- Preparing and executing major system refactoring or ecosystem overhauls.
- Designing or migrating multi-entity corporate platforms with clean route groups and Next.js 16 conventions.

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
- Combine with `<DataTableSkeleton />` displaying `<DataTableLoadingOverlay />` during active refetching or URL transitions.

### 4. Zero `any` & Zero `unknown` Strict Type Safety
- Never use `any` or `unknown` in application hooks, component props, or type definitions.
- For polymorphic input handlers (such as global search), narrow to explicit unions: `val: string | number | boolean | null | undefined`.
- Centralize shared table, map, and select interfaces in `/src/types/components/`.

### 5. TanStack Table React Hooks Immutability Rule
- **Never mutate table instance properties directly** (e.g. `table.options.data = newRecords` or `table.options.rowCount = totalCount`). React Compiler and ESLint `react-hooks/immutability` rule will fail the build with *"This value cannot be modified"*.
- Always pass the reactive query result directly into the `useReactTable({ data, rowCount, ... })` options inside the component, using `useDataTableUrlState` strictly for managing the URL parameters, table state adapters, and event handlers.

### 6. React Hook Memoization & Action Handler Stability (`useMemo` vs `useCallback`)
- When instantiating `columns` with action callbacks (e.g. `onEdit`), define the callback directly inline inside `useMemo(() => getColumns({ onEdit: (item) => { ... } }), [deps])` or consume stable handlers from the feature context.
- Avoid declaring standalone unmemoized handler functions outside `useMemo`, as passing them in the `useMemo` dependency array triggers ESLint warning `The function makes the dependencies of useMemo Hook change on every render`.

### 7. Clean Route Hygiene & Turbopack `.next` Cache Invalidation on Route Deletion
- When converting pages to ActionDialog modals and deleting legacy subroutes (`/create`, `/[id]`, `/[id]/edit`), ALWAYS remove the stale `.next` compilation cache directory (`rm -rf .next`) before running typecheck or build.
- Next.js type generation creates `.next/types/validator.ts` referencing deleted route pages; running `tsc --noEmit` against stale cache causes false `TS2307: Cannot find module` errors until `.next` is purged and rebuilt.

### 8. SSR-Safe Interactive Map Picker (Leaflet Integration Standard)
- **Always split Leaflet into two layers:**
  1. `map-picker-inner.tsx` (the raw Leaflet DOM component importing `leaflet` and `leaflet/dist/leaflet.css`).
  2. `map-picker.tsx` (the wrapper dynamically imported via `next/dynamic(() => import('./map-picker-inner'), { ssr: false, loading: () => <Skeleton /> })`).
- **Teardown Invariant:** In `useEffect` cleanup of the inner map component, call `map.off()` and `map.remove()` to clean up DOM event listeners and prevent *"Map container is already initialized"*.
- **Custom DivIcon Pin:** Use `L.divIcon` with custom Tailwind/HTML styling for crisp, vector-sharp marker pins instead of relying on default Leaflet PNGs which break under Next.js Turbopack image bundling.
- **Bi-directional Form Sync:** Connect `MapPicker` with React Hook Form using `setValue(field, val, { shouldValidate: true, shouldDirty: true })` on `map.on('click')` and `marker.on('dragend')` so user interactions update numeric coordinates immediately, while manual coordinate edits shift the map marker.
- **Container Sizing:** Always trigger `map.invalidateSize()` inside a short timeout (`setTimeout(() => map.invalidateSize(), 200)`) after initialization to ensure tiles render to full container bounds inside dialogs, tabs, or responsive cards.

### 9. Reusable Address Form Suite (`<AddressSection />`)
- Consolidate geographic and territorial address inputs across any entity (Petani, Penyuling, Gudang, Mitra) into a single reusable component: `/src/components/form/address-section.tsx`.
- Features 5-level cascading selectors (`country_id` -> `state_id` -> `city_id` -> `district_id` -> `subdistrict_id`), postal code, detailed address, benchmark, and an embedded `<MapPicker />` with dynamic centroid auto-pan.
- Fully typed in `/src/types/components/address.ts`.

### 10. Hybrid Regional Forms (Domestic vs International)
- All regional forms (Provinsi, Kabupaten, Kecamatan, Kelurahan) provide a toggle between:
  - **Indonesia (Domestik):** Official BPS catalog combobox with auto-fill for name, code, alias, and GPS centroid.
  - **Luar Negeri (Internasional):** Freeform manual text inputs for foreign jurisdictions.
- Enforce mandatory fields: `name` (required), `code` (required), `alias` (required for dropdowns), and `description` (nullable).

### 11. Feature Root Architecture (`index.tsx` SSoT) & Component Standards
- **Root Feature Entry Mandate (`index.tsx` over `feature.tsx`):** Feature folders (`src/features/<entity_ns>/<pillar>/<entity>/`) MUST use `index.tsx` as the single root entry point. Eliminate separate `feature.tsx` and `index.ts` files across all features. `index.tsx` houses `[Entity]Content` and exports `[Entity]Feature`, wrapping the layout cleanly in its Context Provider.
- **The Four-File Feature Architecture Standard:**
  - Every entity CRUD feature in `/src/features/<entity_ns>/<pillar>/<entity>/` MUST strictly consist of the standardized 4-file structure:
    1. `index.tsx`: Feature Page Orchestrator (PageHeader, PrimaryAction, SectionCard, Context Provider, Dialogs mount).
    2. `table.tsx`: Data State Machine (URL state, data queries, column wiring, filter options, `<DataTable />` render).
    3. `columns.tsx`: Declarative column schema definition using `<DataTableColumnHeader />`, `<PrimaryText />`, `<LongText />`, `<IconText />`, `<StatusBadge />`, and `<ActionButton />`.
    4. `dialogs.tsx`: Co-located dialog container aggregating all inspection `<DetailRow />` modals, `<ConfirmDialog />`, and action form dialogs.
  - NEVER introduce ad-hoc files (e.g. `primary-buttons.tsx`, `row-actions.tsx`, `feature.tsx`) or leave out required files.
- **Multi-File Form Subfolder Co-location Contract:**
  - Whenever a form requires secondary helper files (e.g. `foreign-section.tsx`, `options.ts`, `qc-section.tsx`), ALL form-related files MUST be encapsulated inside the `form/` subfolder (`form/index.tsx`, `form/foreign-section.tsx`, etc.).
  - NEVER leave form helper components stranded at the feature root level. The feature root MUST strictly contain only the 4 canonical files plus the `form/` (or `detail/`) directory.
- **Feature Controller Co-location Invariant (`index.tsx` SSoT Controller):**
  - All contexts, data query hooks, translation hooks, and primary action handlers MUST be declared at the top of `[Entity]Content` inside `index.tsx`.
- **PrimaryAction `onClick={handleCreate}` Universal Mandate:**
  - In all `index.tsx` implementations, NEVER hardcode navigation route strings (`href="/scm/..."`) in `<PrimaryAction />`. ALWAYS pass the centralized context dispatcher: `actions={<PrimaryAction onClick={handleCreate} label={...} />}`.
- **Centralized Context Directory Standard (`/src/contexts/<entity_ns>/<pillar>/`):**
  - ALL React context providers, types, and hooks MUST reside centrally under `/src/contexts/<entity_ns>/<pillar>/<entity>.context.tsx`.
- **Centralized CRUD Action Dispatcher Contract (Feature Context SSoT):**
  - ALL user CRUD action handlers (`handleCreate`, `handleEdit`, `handleView`, `handleDelete`, `handleArchive` / `handleToggleStatus`) MUST be centralized within the entity's React Context.
- **Mandatory Entity Dialog Co-location & Integration Gate:**
  - Every entity datatable that offers delete, archive, or edit actions MUST have an accompanying `<EntityDialogs />` (`dialogs.tsx`) mounted directly inside `index.tsx`.
- **Direct `<LongText />` Styling & Elimination of Redundant Outer Spans:**
  - Pass styling classes directly to `<LongText className="..." />`. Never wrap inside redundant outer `<span>` or `<div>`.
- **Semantic Tailwind Spacing Tokens over Arbitrary Bracketed Pixels:**
  - Exclusively use standard Tailwind v4 spacing utility classes: `max-w-35`, `max-w-40`, `max-w-45`, `max-w-50`, `max-w-55`, `max-w-60`, `max-w-65`.
- **Dedicated Textarea for Multiline Inputs:** In both modal `ActionDialog` and full-page forms, ALWAYS use shadcn `<Textarea rows={3} />` for multiline descriptions or detailed addresses.
- **ActionDialog Spacing Standard:** `DialogFooter` must have `mt-4 pt-3 border-t border-border/50 gap-2`.
- **Sidebar Exact Path Matching for Overviews:** In `nav-group.tsx`, overview routes must match strictly on exact pathname (`pathname === item.url`), never prefix (`startsWith`), so navigating into nested feature routes does not leave the overview menu item highlighted.

### 12. Session Integrity & Server Action Authorization (P0)
- HttpOnly, Secure and SameSite protect transport and script access only; they do not make a cookie tamper-proof. A base64/JSON session cookie is forgeable, so a client can mint `uid`, `companyId` or `isAdmin` and the UI will trust it.
- Encode sessions as `base64url(payload).HMAC-SHA256(payload, SESSION_SECRET)` with `iat`, `exp` and a version, then verify signature and expiry in both `proxy.ts` and server-side `getSession()` using Web Crypto (edge-compatible). Reject unsigned or legacy cookies; rotate `SESSION_SECRET` to invalidate all sessions.
- Never treat cookie presence as authentication. Every Server Action must call a typed `requireSession()` guard first, and derive `companyId`, role and permissions from the verified token or a server-side lookup — never from form data, props or an unverified claim.
- When the RPC client authenticates with one shared env API user, Odoo ACL is bypassed for every caller. Either carry a per-user Odoo session/API key, or restrict the shared user's ACL and enforce app-level authorization explicitly; document the residual risk. Audit every action file for a guard — page redirects and the proxy do not protect action POSTs.
- Add tests for missing, tampered, expired and cross-company sessions. A forged `uid`, `companyId` or `isAdmin` must not read or write another company's records.
- **Directive placement:** `'use server'` must be the first statement in a Server Action file. An import, comment, or any content above it silences the directive, so the export becomes a plain function and session guards never run. After bulk codemods or `prettier --write` over `src/actions/*.ts`, grep each file and verify the directive sits at the very top before running typecheck or build.

### 13. Scoped `next-intl` client messages must cover the whole subtree
- When a layout passes a filtered subset to `NextIntlClientProvider`, that key list is a contract: inventory every `useTranslations('<namespace>')` below it and include each top-level namespace. A root layout commonly keeps only `common` + `nav` while the root page or a shared header still calls `inventory` or another pillar namespace.
- Symptoms are `MISSING_MESSAGE: <namespace> (<locale>)` in the server log and raw keys such as `inventory.kpi.on_hand` rendered in the UI; the route still returns 200, so HTTP-status checks miss it.
- Use an explicit `pickMessages(messages, [...])` allowlist per route group plus an automated coverage check. After changing the allowlist, rebuild and smoke-test `/en` and `/id` on the root page and one nested page with the server log visible.
- Keep the full `getMessages()` payload at the root until a measured payload reduction justifies per-pillar scoping; a namespace that no longer resolves is a regression, not a rendering detail.

### 13b. Post-Change Build Verification for i18n and Server-Action Edits
- After changing a `pickMessages` allowlist, adding or editing any `src/actions/*.ts`, run in order: `npx prettier --write <changed files>`, `npm run typecheck` (exit 0), `rm -rf .next` (stale route types cause false `TS2307`), `npm run build` (exit 0), restart the app server, then smoke-test `/en` and `/id` on the root page and one nested page with the server log visible.
- Assert `MISSING_MESSAGE` count is 0 in the server log; raw untranslated keys like `inventory.kpi.on_hand` in the UI mean a namespace is missing from the allowlist — a 200 HTTP status does not catch this.
- Rule: every `useTranslations('<namespace>')` call under a scoped provider must have its top-level namespace in the provider's allowlist. Treat a missing namespace as a regression, not a rendering detail.

### 32. Multi-Entity Bounded Architecture & Route Group Standards
- **Multi-Entity Clean Routing via Next.js Route Groups:**
  - When grouping corporate features by owning entity (`sbi`, `spba`, `sammend`, `sg`), encapsulate them inside parenthesis Route Groups (`src/app/[locale]/(dashboard)/(sbi)/...`, `(spba)/...`).
  - Route groups preserve clean root-level URLs in the browser (`/scm/farmers`, `/wms`, `/crm`) while enforcing modular folder organization on disk.
- **Next.js 16 Proxy Convention (`src/proxy.ts`):**
  - In Next.js 16+, deprecate `src/middleware.ts` and declare proxy handling in `src/proxy.ts` exporting a named `proxy` function to satisfy the latest framework conventions and prevent deprecation warnings.
- **Locale-Aware Link Component Mandate:**
  - In interactive text components (such as `LinkText`), always import `Link` from `@/i18n/navigation` instead of `next/link` to guarantee automatic prefixing of the active locale (`/id/` or `/en/`).
- **Metadata Title Suffix Deduplication Invariant:**
  - When the root layout defines a title template (e.g. `%s • SYAILENDRA ERP`), child page metadata titles MUST only supply the page title (e.g. `title: 'Farmers & Plantations'`). Never append the product brand suffix manually (e.g. avoid `title: 'Farmers & Plantations • Syailendra ERP'`), as Next.js automatically appends the template suffix, causing double-branded document titles in browser tabs.
