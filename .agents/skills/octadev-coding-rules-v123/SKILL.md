---
name: octadev-coding-rules-v123
description: "Use when building, writing, or reviewing code in Octa Hub."
version: 76.0.0
author: "Octa Hub"
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags:
      - engineering-rules
      - clean-code
      - architecture
      - nextjs
      - typescript
      - strict-typing
      - zero-any-unknown
      - form-schema-required-parity
      - empty-default-values-isolation
      - dynamic-regional-prefix-sync
      - optional-number-nan-neutralization
      - zero-helper-affix-labels
      - faceted-filter-chunking
      - parent-direct-filter-query
      - unlink-model-parity
      - datatable-status-filter-symmetry
      - unconditional-reactive-alias
      - next-intl-toast-parity
      - regional-centroid-fallback
      - single-line-stacked-inputs
      - reusable-data-badge
      - 100-percent-real-gps-seeding
      - centralized-map-dir
      - zero-map-residuals
      - dynamic-sequence-active-test-false
      - selective-status-elimination
      - standardized-interactive-text
      - reusable-address-card
      - benchmark-persistence-parity
      - comment-concatenation-prevention
      - action-dialog-view-detail
      - regional-detail-2col-layout
      - reusable-turnstile-controller
      - multi-entity-navigation-parity
      - enterprise-typography-standard
      - multi-entity-folder-isolation
      - nextjs-route-groups-clean-urls
      - next16-proxy-convention
      - absolute-metadata-title-hygiene
      - i18n-navigation-link-mandate
      - navbar-sidebar-gradient-parity
      - derived-matrix-state-contract
      - universal-default-control-sizing
      - reusable-dropdown-select
      - integrated-identity-logo-card
      - official-holding-hierarchy-order
      - global-site-config-theme-injection
      - reusable-image-viewer-dropzone
      - full-width-pill-tabs
      - prettierignore-static-catalogs
      - floating-action-buttons-dropzone
      - dedicated-logos-section-fullwidth
      - reusable-color-input
      - reusable-info-alert
      - zero-company-default-image
      - layout-mirrored-feature-skeleton
      - rhf-values-prop-zero-fake-defaults
      - ergonomic-dropzone-bounds
      - dynamic-holding-footer-name
      - static-i18n-key-audit
      - preserve-user-manual-edits
      - vertical-field-subinstruction-stack
      - zero-border-zero-flash-skeleton-card
      - nextjs-server-actions-body-size-limit
      - dropzone-absolute-fill-collapse-prevention
      - dual-contrast-floating-action-buttons
      - company-switcher-dropdown-width-standard
      - next16-experimental-server-actions-placement
      - minified-react-error-441-prevention
      - base64-normalization-crop-and-odoo-symmetry
      - image-viewer-fallback-fullwidth-primary
      - universal-user-avatar-standard
---

# Octa Hub & Syailendra Engineering Rules (Permanent Standard — Version 123)

## When to Use
Use whenever writing, reviewing, refactoring, or planning any code, components, folder structures, or documentation for Octa Hub and Syailendra projects. Mandatory check before any file edits.

## 1. Absolute Code Invariants

1. **Strict English in Code:** All code, variables, functions, comments, commits, and technical docs in professional English.
2. **Zero `any` & Zero `unknown` (Strict Type Safety Invariant):**
   - NEVER use `any` or `unknown` in application code, components, props, hooks, server actions, or React Contexts.
3. **Next.js, TypeScript, shadcn & Tailwind Best Practices:**
   - Always write idiomatic Next.js App Router code (Server Components where appropriate, minimal client boundaries with `'use client'`, typed Server Actions with `revalidatePath`).
4. **Zero Hardcoded UI Text & Complete Multi-Locale Dictionary Sync:**
   - Never hardcode text strings in UI components, form placeholders, table headers, loading skeletons, or toast notifications.
   - Always use internationalization (`next-intl`) translation keys from `/src/messages/{locale}/` synced symmetrically across `id` and `en`.
5. **Non-Numeric Section Titles in Complex Forms:**
   - NEVER prefix form section titles with numbering (e.g. avoid "1. Identitas", "2. Lokasi", "3. Komoditas"). Use semantic titles.
6. **Hard File Line Limit (< 300 Lines) & Modular Section Decomposition:** No single file may exceed 300 lines of code.

## 2. Feature Architecture, Datatable & Context Standards

141. **The Four-File Feature Architecture Standard:**
     - Every entity CRUD feature in `/src/features/<entity_ns>/<pillar>/<entity>/` MUST strictly consist of the standardized 4-file structure: `index.tsx`, `table.tsx`, `columns.tsx`, and `dialogs.tsx`.

144. **Form & Detail Modularity & Inspection Standard:**
     - **Simple Entities (Modal ActionDialog):** Modals MUST use `<ActionDialog formId="[feature]-form" />` with `DialogFooter` spacing `mt-4 pt-3 border-t border-border/50 gap-2`.
     - **Complex Entities (Dedicated Page Routes):** Dedicated full-page forms (`.../create`, `.../[id]/edit`) MUST decompose into modular sections under `form/` (e.g. `identity-section.tsx`, `address-section.tsx`), guaranteeing zero files exceed 300 lines.
     - **Universal `<DetailRow />` Inspection:** Read-only inspections MUST use `<DetailRow />` (`@/components/shared/detail-row`) with `mono` enabled for codes, numbers, and coordinates.
     - **Multiline Input Enforcement:** Multiline inputs for detailed addresses, descriptions, benchmarks, or notes MUST exclusively use `<Textarea rows={3} />`. Never use single-line `<Input />`.

153. **PageHeader Integrated Back Button & Dedicated Page Form Actions Standard:**
     - In all page-based forms (`.../create`, `.../[id]/edit`), ALWAYS use `<PageHeader>` at the top with integrated back button and top actions.

158. **Standardized Reusable AddressSection 2-Column Responsive Layout Standard:**
     - Wrapped in `<div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">`.
     - Left Column: 2-column administrative inputs and full-width multiline address stack.
     - Right Column: 380px Leaflet Map and 2-column coordinate inputs with dynamic Google Maps link.

159. **Multi-Tier Regional Centroid Auto-Pan & Bi-Directional Coordinate Synchronization Contract:**
     - Auto-pan camera and populate coordinates on administrative selection (Country Zoom 5, Province Zoom 8, City Zoom 11, District Zoom 13, Village Zoom 15).
     - **Zero-Coordinate Fallback Guard:** Because uncurated records default to `0.0`, only trigger map `flyTo` and overwrite coordinates when non-zero centroids exist (`lat !== 0 && lng !== 0`), otherwise preserve the parent tier camera position instead of panning to `[0, 0]`.

162. **Odoo ORM Unlink Model Parity Invariant:**
     - Always verify that the model string passed to `odoo.client.unlink` exactly matches the target entity model (`res.country.city`, `res.country.district`, `res.country.subdistrict`, `res.country.state`).

173. **Zero Helper Affix Labels in Form Inputs Standard:**
     - Never append descriptive or contextual UI notes into form labels (e.g. NEVER use `"Nama Alias (dropdown)"`).
     - Form labels must strictly remain clean, professional, and semantic without helper parentheses: `"Nama Alias"` (ID) and `"Alias Name"` (EN).

174. **Datatable Faceted Filter Progressive Chunking & Dynamic Search Contract:**
     - In relational filters over large datasets (514 regencies, 7,288 districts), NEVER render all options simultaneously into the DOM.
     - Implement client-side progressive chunking (`CHUNK_SIZE = 50`) on `<CommandList onScroll={handleScroll}>`, with `<Command shouldFilter={false}>` and fast in-memory substring filtering (`options.filter(...)`).

176. **Datatable Status Filter URL Query & State Symmetry Contract:**
     - In datatable status filters (`active` / `status`), ensure strict 3-way synchronization between URL search parameters, filter dropdown option values, and data query parameters.

178. **Modular next-intl Message Loader Mapping Parity (Toast Translations Contract):**
     - In modular `next-intl` setups where granular JSON sub-files are imported, nested namespaces invoked by UI hooks MUST be explicitly mapped in `src/i18n/request.ts` for every locale.

180. **Optional Numeric Input NaN Neutralization Contract (`setValueAs`):**
     - In React Hook Form with Zod, sanitize optional numeric inputs via `setValueAs: (v) => (v === '' || v === null || isNaN(Number(v)) ? undefined : Number(v))` and initialize empty defaults as `undefined`.

181. **Universal Regional MapPicker & Modal 2-Column Responsive Standard:**
     - All 5 regional master entity forms widen `ActionDialog` to `maxWidth="sm:max-w-3xl"` and use a 2-column responsive layout (`grid grid-cols-1 items-start gap-5 lg:grid-cols-2`).

182. **Single-Line Stacked Administrative Inputs Invariant:**
     - Inside modal dialog forms, administrative inputs and cascading selectors MUST be full-width stacked vertically 1-per-line (`space-y-3.5`). The ONLY element permitted to use a 2-column grid is the `Latitude` and `Longitude` coordinate pair.

183. **Reusable Data Badge Architecture & Repository Hygiene Standard:**
     - Generic data badges MUST reside in `src/components/shared/data-badge.tsx` under the semantic component name `DataBadge`. Delete obsolete files immediately.

184. **Nationwide 100% Real Geocoding & Fast Bulk Ingestion Protocol:**
     - For large-scale spatial populations, pipe transactional SQL batch statements directly via container CLI `docker exec -i <db_container> psql -U <user> -d <db> < batch.sql` to execute batch updates in seconds.

185. **Centralized Geospatial Architecture & Zero Map Residuals Standard:**
     - All map-related components, inner Leaflet implementations, and composite controls MUST reside strictly in `@/components/map/`.

186. **Dynamic Regional Entity Identifier Sequence Generation (`[ENTITY]-[PREFIX]-[NO]`):**
     - In Odoo RPC `search_read`, ALWAYS pass context `context: { active_test: false }` or query `['active', 'in', [True, False]]` to prevent suffix collisions with archived records.

188. **Standardized Interactive Text Architecture (`LinkText`, `CoordsLink`, `CopyableText`):**
     - Hyperlinks, maps coordinates, and clipboard targets MUST consume standardized reusable components in `@/components/text/`.
     - In `LinkText`, ALWAYS import `Link` from `@/i18n/navigation` (NEVER from `next/link`) to guarantee locale prefix retention.

189. **Standardized Reusable Address Card Architecture (`<AddressCard />`):**
     - Master address details MUST consume `<AddressCard />` in `@/components/card/address-card.tsx` with field landmark (`address_benchmark`) rendered unconditionally.

191. **ActionDialog Standard for Inspection Modals & Regional 2-Column Responsive Detail:**
     - All read-only entity inspection modals MUST consume `<ActionDialog />` instead of raw `<Dialog />` primitives.

192. **Reusable Cloudflare Turnstile Controller & Zero State-in-Effect Invariant:**
     - NEVER redeclare local `useState`, `resetTrigger`, or manual `setValue('turnstileToken')` across individual form features.
     - **Schema Helper (`withTurnstileSchema`):** Wrap base Zod object schemas in `@/utils/schema-helper` via `withTurnstileSchema(baseSchema, t)`.
     - **Form Controller Integration (`<TurnstileField />`):** Consume the standardized `<TurnstileField control={control} action="..." />` component (`@/components/form/turnstile-field`) using `useController`.
     - **Zero State-in-Effect Rule:** In React Compiler / React 19, NEVER call `setState` synchronously within a `useEffect` to trigger widget reset, as it violates `react-hooks/set-state-in-effect`. Instead, derive `resetTrigger = !isSubmitting && !isSubmitSuccessful ? submitCount : 0` directly during render, and only clear `field.onChange('')` when an active submission completes without success (`submitCount > prevSubmitCountRef.current && !isSubmitting && !isSubmitSuccessful`).
     - **Initialization Polling Fallback:** In `<TurnstileWidget />`, combine `<Script strategy="afterInteractive" />` with an interval polling fallback for `window.turnstile.ready(renderWidget)` to eliminate silent render failures when the CDN script finishes loading before/after DOM component mounting.

193. **Multi-Entity Multi-Company Navigational Scoping & Two-Way Route Sync:**
     - In multi-entity enterprise architectures (e.g. Syailendra Group 4 PTs), isolate operational modules strictly by company:
       - **Holding Parent: `SYAILENDRA GROUP (SG)` (`sequence = 1`):** Corporate Sustainability, ESG, Impact Measurement (`imm`), and System Administration (`others`).
       - **Subsidiary: `PT SYAILENDRA BUMI INVESTAMA (PT SBI)` (`sequence = 2`):** Strategic Holding, Finance & Tax (`ftm`), Human Resources (`hrm`), and Upstream Traceability (`scm`).
       - **Subsidiary: `PT SYAILENDRA PABRIK BERSAMA (PT SPBA)` (`sequence = 3`):** Essential Oil Distillation & Warehouse Management System (`wms`).
       - **Subsidiary: `PT SYAILENDRA MAHAKARYA MENDUNIA (PT SAMMEND)` (`sequence = 4`):** Global B2B Commercial (`crm`), Omnichannel Marketplace (`dcm`), and Intelligent AI Assistant (`ai`).
     - **Zustand Persistence:** Store active company state in `useEntityStore` using `persist` middleware so page reloads do not snap back to holding.
     - **Two-Way Route Synchronization:** Implement an automatic route-watcher inside `AuthenticatedLayout` that resolves the owning company from the active pathname (e.g. `/wms` -> `spba`) and synchronizes `activeEntityId`. This prevents blank navigations or sidebar mismatch when users navigate via direct URLs or bookmarks.
     - **Odoo Multi-Company JSON-RPC Context:** Pass `context: { allowed_company_ids: [activeCompanyId] }` via `OdooClient` methods. When registering companies in Odoo 18, update `res.company` names and user `company_ids` directly; do NOT attempt modifying existing company `parent_id` via ORM if charts of accounts or journals already exist, as Odoo enforces `'The company hierarchy cannot be changed.'`.
     - **CommandMenu & i18n Key Parity:** Filter `CommandMenu` (`⌘K`) modules and items by `activeEntity.pillars` so cross-company navigation stays isolated, and verify dropdown/switcher `roleKey` strings against live locale JSON keys (`entities.sbiRole`) in the rendered browser DOM.

194. **Enterprise Theme, Symmetrical Floating Shell & Primary Contrast Standards:**
     - **Symmetrical Floating Navbar & Sidebar Geometry:** When pairing a floating sidebar (`variant="floating"`, `p-2` outer gap, `rounded-lg shadow-md`) with a primary-colored navbar (`#004E52`), NEVER render the navbar as a full-bleed docked bar (`top-0 rounded-none`) — colliding a flush square bar against an inset rounded sidebar creates staggered top offsets, sharp-vs-rounded corner clashes, and an awkward seam. Wrap `<Header>` in a matching sticky floating offset (`sticky top-0 z-40 pt-2 pe-2 pb-1 max-md:ps-2`) with `<header className="rounded-lg border border-white/10 shadow-md">`, match `SidebarHeader` height (`h-16 justify-center border-b border-white/10 p-2`) to the `h-16` navbar so dividers and controls share one horizontal centerline, and align `<Main>` outer padding (`py-5 pe-2 max-md:ps-2 md:ps-0`) flush with the navbar's outer card bounds.
     - **Harmonized Dynamic Header & Sidebar Gradients:** When the sidebar background applies a dynamic CSS gradient derived from `--primary` via `color-mix()` in both light and dark modes, bind the `<Header>` navbar to the identical background tokens (`backgroundColor: 'var(--sidebar)', backgroundImage: 'var(--sidebar-gradient)'`). This guarantees that header and sidebar share an identical visual depth and automatically harmonize when theme primary colors change.
     - **Active Item Indicator (Opsi A):** Use elevated translucent fill `bg-white/15`, bold white text, and an Accent Gold (`#E8AE1E`) indicator border (`border-b-2` for top navigation, `border-l-[3px]` for sidebar items) with matching gold icon `text-brand-gold`.
     - **Utility Controls Adaptability:** Reusable global buttons (such as `LanguageToggle`, `ThemeToggle`, `Search`) MUST support optional `className` overrides. Pass translucent frosted styles (`border-white/20 bg-white/10 text-white hover:bg-white/20`) when placed on dark primary shells, preserving default outline styling on light page backgrounds.
     - **Tipografi Tabular Numerik:** Use `Plus Jakarta Sans` as the primary enterprise typeface and enforce `font-variant-numeric: tabular-nums` (`tabular-nums`) across all data tables and numeric KPI badges.

195. **Pillar-First Flattened Folder Architecture & Next.js 16 Conventions:**
     - **Domain Organization by Functional Pillar:** Partition code directly by functional pillar (`ftm`, `hrm`, `scm`, `wms`, `crm`, `dcm`, `ai`, `imm`, `others`) across all core layers (`src/types/<pillar>/`, `src/schemas/<pillar>/`, `src/services/odoo/<pillar>/`, `src/actions/<pillar>/`, `src/contexts/<pillar>/`, `src/hooks/<pillar>/`, `src/features/<pillar>/`, `src/messages/{locale}/<pillar>/`, and `src/app/[locale]/(dashboard)/<pillar>/`). Do NOT nest folders inside corporate entity names (`sbi/`, `spba/`), because pillars can be dynamically reallocated across entities.
     - **Next.js 16 Proxy Convention (`src/proxy.ts`):** In Next.js 16+, deprecate `src/middleware.ts` in favor of `src/proxy.ts` exporting a named `proxy` function to eliminate build-time deprecation warnings.
     - **Metadata Title Template Hygiene:** When the root layout defines a title template (e.g. `%s • SYAILENDRA ERP`), child page metadata titles MUST only supply the page title (e.g. `title: 'Farmers & Plantations'`). Never append the product brand suffix manually, as Next.js automatically appends the template suffix.

196. **Derived State Over Synchronous Effect (Zero State-in-Effect Rule for Dynamic Matrices):**
     - In cross-entity matrix interfaces (such as `/others/menus`), NEVER copy server query data into local state synchronously inside a `useEffect` (`setOwnerMap(nextMap)`), as React 19 / ESLint flags `react-hooks/set-state-in-effect`. Instead, compute `serverOwnerMap` with `useMemo` from the query result, track only local user edits via `overrides = useState({})`, compute `ownerMap = useMemo(() => ({ ...serverOwnerMap, ...overrides }), [serverOwnerMap, overrides])`, and clear overrides upon successful save.

197. **Mandatory Reusable UI Primitives (`LoadingButton`, `PillTabs`, `SectionCard`, `SummaryCardGrid`):**
     - **Async Submit & Action Buttons (`<LoadingButton />`):** Every button with a loading/pending state (`ActionDialog`, `ConfirmDialog`, dedicated page forms, auth forms) MUST use `<LoadingButton isLoading={...} loadingText={...} icon={...} />` from `@/components/button/loading-button`. Never write inline `{isPending ? <Loader2 /> : <Save />}` ternary blocks in feature components.
     - **Entity & Category Switcher Pills (`<PillTabs />`):** Use `<PillTabs items={...} value={...} onValueChange={...} />` from `@/components/button/pill-tabs` with default button sizing whenever rendering horizontal pill switchers (such as multi-company selector bars). The container MUST span `w-full` and each button MUST use `flex-1` so tabs distribute evenly across the full row width.
     - **Form & Table Containers (`<SectionCard />`):** Wrap all form sections and datatable containers in `<SectionCard title={...} description={...} icon={...} />` from `@/components/card/section-card` instead of raw `<Card><CardHeader>` markup.
     - **In-File Summary Card Definition (`<SummaryCardGrid />`):** Feature KPI summary strips MUST consume `<SummaryCard />` or `<SummaryCardGrid />` (`@/components/card/summary-card`) defined directly as a sub-component inside the feature's `index.tsx` (never in a separate `summary-cards.tsx` file).
     - **DataTable Faceted Filter Column Key (`columnId`):** When configuring `DataTableFilterField[]` for `<DataTable filters={...} />`, always specify `columnId` (matching the TanStack Table column `accessorKey`/`id`) and attach a string-coercing `filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id)))` when filtering numeric foreign-key columns such as `company_id`.

198. **Mandatory Default Control Sizing & Reusable Dropdown Standard:**
     - **Universal Default Sizing (Zero `size="sm"` for Interactive Controls):** All `<Button>`, `<LoadingButton>`, `<Input>`, `<Textarea>`, and `<SelectTrigger>` components across forms, dialogs, headers, and toolbars MUST use the standard default sizing (height `h-9` or `h-10`, default padding, standard font size). NEVER pass `size="sm"` or ad-hoc downsizing classes (`h-7`, `h-8`) to buttons and inputs. (The ONLY components permitted to carry `size="sm"` are non-interactive badge indicators: `<StatusBadge />` and `<DataBadge />`).
     - **Reusable Action & Selection Dropdown (`<DropdownSelect />`) & Short-Alias Column Standard:** Action selections and entity reassignments inside datatables or cards MUST consume `<DropdownSelect />` from `@/components/button/dropdown-select` instead of embedding raw `DropdownMenu` boilerplate. The component supports generic values (`<T extends string | number>`), options with `icon`, `title`, `subtitle`, and `badge`, an automatic active item indicator (`bg-primary/10 text-primary font-bold` + `<Check />`), and default button sizing. Inside datatable columns, keep the trigger and menu options concise by displaying only the entity alias/short name (`SG`, `SBI`, `SPBA`, `SAMMEND`) rather than concatenating long legal names that widen table columns.
     - **Typography Separator Hygiene (Zero Mid-Dot `•`):** Never use mid-dot bullets (`•`) as inline text separators in PillTabs, SummaryCard titles, SelectForm options, DetailRow values, or dropdown items. Use clean typographic hyphens (` - `) or vertical pipes (` | `) instead (e.g. `SG - SYAILENDRA GROUP`).
     - **Integrated Identity & Logo Section Card:** In company and entity management forms, corporate logo upload/preview MUST be encapsulated directly within the `<IdentitySection />` inside a single unified `<SectionCard title="..." description="..." icon={...}>` (never separated into a detached floating card). This keeps 2-column dashboard form layouts visually balanced and eliminates stranded sub-components.
     - **Official Multi-Entity Hierarchy Order:** In multi-entity conglomerates (Syailendra Group), always order and seed entities strictly according to corporate governance hierarchy in both database queries (`order: 'sequence asc, id asc'`) and reactive state stores (`useEntityStore`):
       1. Holding Parent: `SYAILENDRA GROUP (SG)` (`sequence = 1`)
       2. Strategic & Financial: `PT SYAILENDRA BUMI INVESTAMA (SBI)` (`sequence = 2`)
       3. Manufacturing & Facilities: `PT SYAILENDRA PABRIK BERSAMA (SPBA)` (`sequence = 3`)
       4. Commercial & Omnichannel: `PT SYAILENDRA MAHAKARYA MENDUNIA (SAMMEND)` (`sequence = 4`)

199. **Global Site Config & Dynamic Theme Invariant (`syailendra.site.config`):**
     - Global branding parameters (Website Name `site_name`, Descriptor `site_descriptor`, Login Tagline `login_tagline`, Welcome Card Title/Desc, Footer Notice, 3 Core Logos `logo_light`/`logo_dark`/`logo_monogram`, and dynamic theme colors `primary_light`, `primary_dark`, `bg_light`, `bg_dark`, `accent_gold`) MUST reside in the singleton backend model `syailendra.site.config` at `addons/models/site/site_config.py`.
     - In the Next.js client, hook `useSiteConfigHydration()` (`@/hooks/others/use-website`) injects dynamic theme custom properties into `<head id="syailendra-dynamic-theme">`. Because sidebar and navbar gradients are computed via `color-mix(in srgb, var(--primary) ..., #000000)`, modifying the primary color in `/others/website` immediately updates buttons, rings, sidebars, and navbars across both light and dark modes without page reload or hardcoded CSS changes.

200. **Reusable Media Components (`<ImageViewer />`, `<FileDropzone />`, `<CropDialog />`, `getInitials`, `crop-image.ts`) & Native Odoo Filestore Storage:**
     - **Odoo 18 Filestore Binary Storage (`attachment=True`):** All binary image fields in Odoo models (`logo_light`, `logo_dark`, `logo_monogram`, etc.) MUST specify `attachment=True` so Odoo stores binary blobs on the VPS filesystem (`/var/lib/odoo/filestore/<db>/`) with SHA-1 deduplication rather than bloating PostgreSQL tables.
     - **Universal `<ImageViewer />` (`@/components/image/image-viewer`):** All rendered images, entity logos, and product media MUST use `<ImageViewer />` (powered by `viewerjs` for zoom/rotate/fullscreen inspection when `!disabled`). When `src` is missing or fails to load, it automatically renders an initials badge computed via `getInitials(fallbackText || alt)` (`@/utils/get-initials`), which strips corporate prefixes (`PT`, `CV`) to produce clean entity initials, and normalizes raw Odoo base64 payloads via `resolveImageSrc(src)`.
     - **Universal `<FileDropzone />` & `<CropDialog />` (`@/components/image/`):** All form image upload fields MUST use `<FileDropzone />` (powered by `react-dropzone` and `<CropDialog />` using declarative `react-easy-crop` + pure HTML5 2D Canvas helper `getCroppedImg` in `@/utils/crop-image.ts`, which preserves PNG/WebP alpha transparency instead of forcing opaque JPEG). Configure maximum upload size limits via `.env` (`NEXT_PUBLIC_MAX_IMAGE_SIZE_MB`, `NEXT_PUBLIC_MAX_VIDEO_SIZE_MB`) rather than hardcoding byte limits in individual forms.
     - **Entity Logo Propagation in Switchers & Dropdowns:** Both the sidebar `CompanySwitcher`, `<PillTabs />`, and entity selection `<DropdownSelect />` components MUST display the active logo of each company (`logo_web` / `logoBase64`) via `<ImageViewer disabled />` alongside its short code, falling back to `getInitials` or the global monogram when no custom logo is uploaded.
     - **Prettier Exclusion for Massive Static JSON Catalogs:** Always exclude large static dataset directories (such as `src/data/indonesia-regions/catalog/**`) in `.prettierignore` so running `prettier --write src/` does not touch thousands of static JSON files and pollute `git status`.

201. **Floating Action Buttons & Strict Aspect-Ratio Symmetry for `<FileDropzone />`:**
     - In `<FileDropzone />`, action buttons for file removal (`delete`) and re-cropping (`crop`) MUST be rendered as small floating action buttons positioned on the preview container rather than placing a horizontal button toolbar underneath:
       - **Top-Right Corner (`absolute top-2 right-2 z-20`):** `<ActionButton variant="delete" icon={X} label={t('removeFile')} className="size-7 rounded-full shadow-md" />` for one-tap deletion.
       - **Bottom-Right Corner (`absolute bottom-2 right-2 z-20`):** `<ActionButton variant="custom" icon={Crop} label={t('cropAction')} className="size-7 rounded-full border-white/25 bg-black/65 text-white backdrop-blur-sm shadow-md" />` for re-opening the crop dialog.
       - **Bottom-Left Corner (`pointer-events-none absolute bottom-2 left-2 z-10`):** Frosted file name badge shown on group hover (`opacity-0 group-hover:opacity-100`).
     - **Aspect-Ratio Parity:** When `aspectRatio` is provided (e.g. `1` for square logo, `4/3` for landscape banner), both the empty dashed dropzone container and the image preview container MUST apply `style={{ aspectRatio }}` so the spatial dimensions are 100% identical before and after image selection, eliminating visual layout jump.

202. **Dedicated Full-Width Branding Logo Sections vs 2-Column Content Grids:**
     - In website, portal, or branding configuration forms, brand logos MUST be encapsulated in a dedicated full-width `<LogosSection />` (spanning all logo variants horizontally in a 3-column grid: Light Mode 4:3, Dark Mode 4:3, Monogram 1:1) placed above the 2-column content grid.
     - Do NOT squeeze logos into side-column cards with text fields; separate them into a full-width section card so dropzones have sufficient horizontal width to maintain aspect ratio without excessive vertical stretching.

203. **Reusable Color Form Control (`<ColorInput />`) & 2-Column Palette Layout:**
     - Form color pickers MUST use the centralized reusable `<ColorInput />` (`@/components/form/color-input`) combining an interactive `<input type="color">` swatch with an uppercase hex `<Input className="font-mono uppercase">`, semantic label, description, and Zod error state, with real-time two-way synchronization.
     - Color palette settings sections MUST arrange color controls in a responsive 2-column grid (`grid grid-cols-1 sm:grid-cols-2 gap-3`) with primary contrast preview underneath.

204. **Reusable Semantic Informational Alert Component (`<InfoAlert />`):**
     - Informational notice banners and platform rules MUST use the reusable `<InfoAlert />` (`@/components/shared/info-alert`) supporting semantic variants: `info` (`border-primary/30 bg-primary/5 text-primary` with `ShieldCheck`/`Info`), `warning`, `destructive`, and `success`, with `title`, `description`, `icon`, and `children` props. Never write inline `<Alert className="border-primary/30 bg-primary/5">` boilerplate across feature views.

205. **Zero Default Static Images for Multi-Entity Companies (Dynamic Initials Invariant):**
     - In multi-company switchers, headers, tab pills, and data tables, NEVER fall back to a hardcoded holding logo asset (`syailendra_logo_monogram_only.png`) when an entity lacks a custom logo (`logo_web` / `logoBase64`).
     - Pass `src={entity.logoBase64 || null}` and `fallbackText={entity.code}` directly to `<ImageViewer disabled />`, allowing `getInitials(entity.code)` to render a clean, distinct typographic badge (`"SG"`, `"SBI"`, `"SPBA"`, `"SAMMEND"`). This prevents subsidiaries from erroneously inheriting the holding corporation's logo.

206. **Isolated Layout-Mirrored Skeletons per Feature (`skeleton.tsx` Standard):**
     - Every feature module with asynchronous queries MUST isolate its loading skeleton in a dedicated `skeleton.tsx` inside the feature root directory (e.g. `src/features/others/company/skeleton.tsx`, `src/features/others/website/skeleton.tsx`, `src/features/others/menus/skeleton.tsx`).
     - The skeleton MUST structurally mirror 100% of the actual page's layout (matching PageHeader, PillTabs row, full-width section cards, 2-column form grids, and summary cards) with `aria-busy="true"`.
     - Never use generic single-line skeletons or borrow unrelated page skeletons, as layout mismatch causes perceived layout shift (CLS) during hydration.

207. **Zero Hardcoded Fake Default Values for Backend-Driven Forms (`values` Prop Invariant):**
     - For forms editing backend entities (such as company profiles via `useCompaniesQuery()` or website settings via `useSiteConfigQuery()`), NEVER populate `useForm({ defaultValues: { ... } })` with artificial fallback strings or fake business data.
     - Render the feature's dedicated `<Skeleton />` while the query is loading, and bind the fetched record directly via React Hook Form's `values` option (`useForm({ resolver: zodResolver(schema), values: record })`). This keeps the form reactively synchronized with the Single Source of Truth in Odoo without manual `useEffect(() => form.reset(...))` synchronization blocks.

208. **Ergonomic Aspect-Ratio Bounds for `<FileDropzone />` (Anti-Inflation Standard):**
     - Do NOT force unrestricted `w-full` on `<FileDropzone />` when constrained by a fixed `aspectRatio` (e.g. `1:1` square for corporate logos or `4:3` for banners) inside wide form columns, because a 450px column forces a 1:1 dropzone to expand to 450x450px and dominate the section.
     - Constrain square logo/monogram dropzones to compact, ergonomic dimensions (e.g. `max-w-[180px] sm:max-w-[200px] aspect-square`) and landscape logo dropzones to `max-w-[240px] aspect-[4/3]` so the dropzone matches the visual scale of the actual asset.

209. **Dynamic Holding / Business Entity Name in Auth Footers (`company_name`):**
     - Never hardcode the holding or business entity name in authentication footers or copyright notices (e.g. avoid static `&copy; 2026 Syailendra Group`).
     - Store `company_name` in the singleton backend model (`syailendra.site.config`), expose it in the website identity settings form, and render `{siteConfig?.company_name || 'Syailendra Group'}` dynamically.

210. **Automated Static-Analysis i18n Key Parity Audit:**
     - Before completing any feature or refactoring pass, audit all `useTranslations('<ns>')` and `t('<key>')` calls against `src/messages/id/` and `src/messages/en/` as mapped in `src/i18n/request.ts`.
     - Verify both ID-to-EN key symmetry AND zero missing static `t()` keys (including nested objects like `Summary.modulesCount` or `form.category`) so raw translation keys never leak into the rendered UI.

211. **Preservation of User Manual Code Modifications:**
     - Always inspect `git status` and `git diff` (or recently modified files) before writing or patching feature files.
     - When the user has made manual adjustments to component layout, form section ordering, header action buttons, or container classes, preserve those exact changes intact and build around them rather than overwriting them with an earlier template.

212. **Vertical Stacking of Field Sub-Instructions (Zero Horizontal Split for Upload Hints):**
     - Never align helper or file-format instructions horizontally alongside a field or subsection title using `flex items-center justify-between`, as it pushes instructional text to the far right over empty space.
     - Always stack the instructional subtitle vertically directly underneath the field label (`space-y-0.5`) above the input or `<FileDropzone />`.

213. **Zero-Border & Zero-Flash Skeleton Card Surface Parity:**
     - Skeleton card containers in `skeleton.tsx` MUST replicate the exact surface classes of the rendered `<Card>` component (`bg-card shadow-xs rounded-xl p-5` without `border` when `<Card>` is borderless).
     - Never leave skeleton card wrappers transparent (which exposes `--background` during loading and snaps to `bg-card` on render) or add a `border` class that vanishes once loaded.
     - Keep the baseline `.dark` `--background` token in `src/styles/theme.css` (`#181c20`) identical to the backend's default dark canvas (`syailendra.site.config.bg_dark`) so client-side dynamic theme hydration produces zero background color flash.

214. **Next.js Server Actions Payload Body Size Limit (`bodySizeLimit: '10mb'`):**
     - By default, Next.js App Router Server Actions enforce a strict 1 MB request body limit.
     - When submitting forms with base64 image strings or file assets (a 2MB image produces ~2.7MB in base64), Next.js immediately aborts the Server Action with `Error: Body exceeded 1 MB limit (HTTP 413)`.
     - In `next.config.ts`, ALWAYS configure `serverActions: { bodySizeLimit: "10mb" }` (at root or inside `experimental`) so media uploads and corporate logo updates never fail silently.

215. **FileDropzone Absolute-Fill Shrink-to-Fit Collapse Pitfall:**
     - When `<FileDropzone />` with an `aspectRatio` is placed inside flex containers with `items-start`, using a relative `w-full max-w-[240px]` class causes the container to collapse into an 8x8px tiny pill when an image is loaded, because `<ImageViewer fill />` renders `<Image fill />` (`position: absolute; inset: 0`), which has `0px` intrinsic width in the DOM.
     - Always provide explicit base width classes (`w-56 sm:w-60` for landscape > 1, `w-40 sm:w-44` for square/portrait <= 1) rather than relative `w-full` alone, ensuring the preview box maintains its intended pixel bounds regardless of parent flex alignment.

216. **Dual-Contrast Floating Action Buttons on Media Previews:**
     - Action buttons floating over user-uploaded media (Delete on top-right, Crop on bottom-right) MUST remain 100% visible regardless of whether the uploaded image has a pure white, pure black, transparent, or multicolored background.
     - In dark mode, standard transparent/muted button tokens (e.g. `dark:bg-input/30`) turn into translucent white and blend completely into white-background logos.
     - Always enforce high-visibility dual-contrast styling: solid saturated fills (`!bg-red-600` for delete, `!bg-zinc-900/90` for crop), a prominent 2px white border (`border-2 !border-white`), and a black outer shadow ring (`ring-1 ring-black/40 shadow-lg`) across both light and dark modes.

217. **Entity Switcher Dropdown Content Width & Whitespace Standard (`min-w-88 sm:min-w-96`):**
     - In multi-entity conglomerate switchers (`CompanySwitcher`), never constrain the dropdown menu to `min-w-68` or allow truncation of formal company names (`{code} - {name}`).
     - Always set `className="w-88 sm:w-96 min-w-88 sm:min-w-96 rounded-lg"` on `<DropdownMenuContent>` and apply `whitespace-nowrap` on `{entity.code} - {entity.name}` so full legal names (`PT SYAILENDRA MAHAKARYA MENDUNIA`, `PT SYAILENDRA BUMI INVESTAMA`) render completely across all viewport sizes without text clipping.

218. **Next.js 16 Server Actions Configuration Placement:**
     - In Next.js 16+, ensure `serverActions: { bodySizeLimit: "10mb" }` is declared without omitting root compatibility where bundlers evaluate action limits prior to invocation.

219. **Minified React Error #441 Prevention & Targeted Route Revalidation:**
     - Calling `revalidatePath('/', 'layout')` inside Server Actions invoked by client form submissions triggers full-tree server component re-rendering while the client expects a clean action response. In React 19 / Next.js 16, any suspended boundary, layout recalculation, or unhandled stream error during full root revalidation surfaces on the client as `Minified React error #441` ("An error occurred in the Server Components render").
     - Always use granular, targeted route revalidations (e.g. `revalidatePath('/others/website')`, `revalidatePath('/others/company')`, `revalidatePath('/login')`). Never revalidate the root path `'/'` with `'layout'` type from mutation actions.

220. **Base64 Normalization Symmetry in Cropping vs. Odoo `fields.Binary` Storage:**
     - **Client-Side Image Crop Detection (`resolveImageSrc`):** When image data stored in the database is raw Base64 without a Data URI header (`"iVBORw0KG..."`), passing it directly as `imageSrc` to `<Cropper />` or HTML5 `new Image().src` causes the browser to interpret it as a relative URL path (`http://host/iVBORw0KG...`), returning 404 and leaving the crop canvas blank/undetected. Always wrap `previewUrl` and crop inputs in `resolveImageSrc(value)` (`data:image/png;base64,...`) before feeding to canvas or cropper.
     - **Pure Canvas Alpha Transparency Guard:** In `createImage(url)`, never set `image.setAttribute('crossOrigin', 'anonymous')` on `data:` or `blob:` URLs, as cross-origin headers on local data streams trigger canvas taint and security violations.
     - **Odoo ORM `fields.Binary` Base64 Sanitization (`cleanBase64`):** Odoo ORM `fields.Binary(attachment=True)` expects pure raw Base64 strings. Sending a Data URI with prefix (`data:image/png;base64,...`) causes PostgreSQL bytea padding errors. Always strip any prefix using `val.includes(',') ? val.split(',')[1] : val` before invoking `odoo.client.write` or `create`.

221. **`<ImageViewer />` Fallback Full-Width Bounds & Corporate Primary Branding:**
     - When `<ImageViewer />` renders its fallback initials badge (`!resolvedSrc || hasError`) in `fill={true}` mode, the wrapper MUST include `size-full` (`w-full h-full`), otherwise it collapses to 0px width inside flexbox wrappers (such as sidebar company switchers, user profiles, or table rows).
     - Default fallback surface color MUST use corporate brand primary tokens (`bg-primary text-primary-foreground`, e.g. `#004e52` & white) rather than default unbranded muted gray (`bg-muted text-muted-foreground`).

222. **Universal User Avatar Standard across Navbar Header & Sidebar NavUser:**
     - Standardize all user avatar presentations (`NavUser` in sidebar footer, `ProfileDropdown` in top header) to consume the universal `<ImageViewer />` component wrapped inside `aspect-square size-8 shrink-0 overflow-hidden` containers.
     - Do NOT use raw Radix `<Avatar>` / `<AvatarFallback>` components with static one-letter hardcoded initials. Dynamic initials generated via `getInitials(user.name)` guarantee consistent 2-letter uppercase badges and seamless future photo support.

223. **Owner-Gated Git Writes (Commit & Push Approval Barrier):**
     - NEVER run `git add`, `git commit`, or `git push` on your own initiative. Finish the implementation, run the quality gates, then present `git diff --stat`, the proposed commit message(s), and the real exit codes; wait for explicit approval.
     - Commit approval is not push approval. When the owner requires separate gates, stop again after committing and ask before pushing. A generic "continue" does not authorize git writes.
     - Run `git diff <file>` on every file before staging: a file may carry another actor's uncommitted edits (nav/breadcrumb JSON is a repeat offender). Stage explicit paths and disclose hunks you did not author instead of sweeping them into your commit.
