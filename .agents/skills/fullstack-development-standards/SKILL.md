---
name: fullstack-development-standards
description: Use when building fullstack Next.js, shadcn, or web apps.
version: 1.1.0
author: Octa Hub
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags: [fullstack, nextjs, react, shadcn, typescript, tailwind, zod, react-hook-form, recharts, tanstack-query, zustand, dnd-kit]
    category: software-development
---

# Fullstack Development Standards (Next.js + shadcn/ui + TypeScript)

Defines the required engineering standards, preparation workflow, library stack, and pitfalls for modern fullstack web applications.

## When to Apply

- Scaffolding or configuring new Next.js projects (App Router, Turbopack, React 19).
- Integrating UI component libraries (shadcn/ui, Radix UI primitives, Tailwind CSS v4).
- Setting up form handling, data tables, charting, and client state caching.
- Integrating external backend systems or ERP engines (Odoo, REST, JSON-RPC, GraphQL).
- Structuring modular client SDKs and typed ORM bridges.
- Applying code review rules, linting, formatting, and persistent project documentation.
- Adopting AI Developer Documentation Kit standards (AGENTS.md, PRD, ARCHITECTURE, DESIGN, SECURITY, TESTING, DEPLOYMENT, TASK_INSTRUCTION, RULES).

---

## 1. Mandatory Pre-Implementation Protocol

Before generating boilerplate, writing components, or executing mutations:

1. **Mandatory Skill & MCP Reading:**
   - Always read and consult available project skills (`.skills/` in repo and system skills like `ui-ux-pro-max`, `shadcn-code-review`, `nextjs-best-practices`, `typescript`, `tailwind-css`, `odoo-development`).
   - Query **MCP Context7** (`mcp__context7__resolve_library_id` and `mcp__context7__query_docs`) to obtain exact, verified code snippets and syntax for latest package versions.
   - Never rely on outdated mental models or guess framework syntax.
2. **Library Stack Agreement:**
   - Confirm standard package manager (default to official `npm` unless otherwise instructed).
   - Install the unified enterprise stack:
     - **Form & Validation:** `react-hook-form`, `zod`, `@hookform/resolvers`.
     - **Data Fetching & Cache:** `@tanstack/react-query` (with React Query Provider).
     - **Data Tables:** `@tanstack/react-table` (headless, virtualized, multi-filter).
     - **Data Visualization:** `recharts` (charts, sparklines, analytics trends).
     - **Global UI State:** `zustand` (lightweight hook-based store for active tabs, theme, collapse state).
     - **Drag & Drop (Kanban):** `@dnd-kit/core`, `@dnd-kit/sortable` (accessible, mobile touch supported).
     - **Traceability QR:** `qrcode.react` (SVG vector QR rendering).
     - **UI Primitives:** shadcn/ui (`radix-ui`), `lucide-react`, `sonner`, `next-themes`.
3. **Project Documentation SSOT (AI Developer Documentation Kit Standard):**
   - Ensure the repository root contains standard Markdown guidelines:
     - `AGENTS.md`: Architectural rules, boundaries, and AI agent conventions (Permanent System Prompt).
     - `docs/PRD.md`: Scope of modules and acceptance criteria.
     - `docs/ARCHITECTURE.md`: Topology diagram, data flow, and isolation.
     - `docs/DESIGN.md`: UI/UX design tokens, theme palette, and layout wireframes.
     - `docs/SECURITY.md`: Data governance, secret isolation, public trace masking.
     - `docs/TESTING.md`: Mandatory 3-gate pre-commit verification protocol.
     - `docs/DEPLOYMENT.md`: Container topology and production release steps.
     - `docs/TASK_INSTRUCTION.md`: Step-by-step phased engineering checklist.
     - `docs/RULES.md`: Commit discipline, environment safety, data integrity.
   - Bind local copies into `.skills/` inside the project root for self-contained context.
4. **Environment Secret Hygiene & Template Contract:**
   - NEVER commit real credentials, database passwords, or private keys to source control.
   - Always commit a complete `.env.example` defining every required parameter with descriptive placeholder text.
   - Keep active secrets strictly in `.env.local` (chmod 600) and ensure `.gitignore` explicitly unignores `.env.example` while ignoring all active env files (`.env*` + `!.env.example`).
   - Remove all fallback secret literals from client SDKs and component source files (read exclusively from `process.env`).

---

## 2. Architecture & Modular Client Structure

When bridging to backend services (such as Odoo or custom APIs), strictly separate **Low-Level Transport** from **Domain Services**:

```text
src/lib/<service>/
├── client.ts         # Pure low-level transport engine (HTTP/JSON-RPC, auth, session caching, retry)
├── types.ts          # Low-level protocol interfaces & RPC argument domain tuples
└── index.ts          # Transport gateway export (e.g. export const odoo = { client: odooClient })

src/services/odoo/<pillar>/
└── [name].service.ts # High-level domain services grouped by pillar (e.g. traceability, hris, others)
```

- **Separation of Concerns:** Component pages and server actions must call high-level domain services (`src/services/odoo/<pillar>/`), never raw database strings or inline JSON-RPC payloads.
- **Strict Typing:** All data returned must conform to strict TypeScript interfaces. Ban `any` and `unknown` in client return types and service layers.
- **Low-Level Transport Gateway Boundary:** `/src/lib/<service>/` is strictly a low-level RPC transport layer. Never place entity business logic (e.g. `traceability.ts`, `models.ts`) directly in `/src/lib/`.

---

## 3. Formatting, Linting & Verification Gates

Never consider a task complete without passing all three verification gates:

```bash
# 1. Format code with Prettier and Tailwind class sorter
npm run format

# 2. Strict TypeScript typecheck
npm run typecheck

# 3. Production Turbopack build
npm run build
```

---

## 4. Critical Pitfalls & Operational Rules

| Issue / Anti-Pattern | Root Cause | Preventive Rule & Remediation |
| :--- | :--- | :--- |
| **Premature Coding & Generator Rework** | Running `create-next-app` or component scaffolding before confirming stack preferences and wireframes | Align library list, package manager (`npm`), and design system upfront. Query Context7 first. |
| **Out-of-Scope Repository Edits during Reference Study** | Editing workspace files while studying external reference repos (e.g. `satnaing/shadcn-admin`) | Always clone reference repositories into isolated scratch directories (`$TMPDIR`). Keep project git status 100% clean during inspection. |
| **Overwriting User Preset during Component Additions** | Running `shadcn add` with default flags over existing styled components | Preserve project's existing preset (e.g. `radix-vega`, `rtl`, `pointer`). Use selective updates and reject blind component overwrites. |
| **Unvalidated Form Inputs** | Submitting raw state to backend RPC without schema checks | Always wrap inputs in `react-hook-form` with a strict `zod` schema resolver. Catch errors at the field level before network dispatch. |
| **Zod `.default()` Type Divergence with Hook Form Resolvers** | Declaring `.default(...)` on Zod schema properties causes `z.infer<T>` (output type) to diverge from Zod input types (`z.input<T>`) | Do not add `.default()` on Zod form schemas when pairing with `@hookform/resolvers/zod`. Keep the Zod schema clean and provide form default values exclusively via `useForm<FormValues>({ defaultValues: { ... } })` to maintain strict 1:1 type matching. |
| **Sidebar & Route Watcher Desynchronization** | Route-watcher `useEffect` in authenticated layout does not watch newly added pillar route segments (e.g. `/others/*`) | Whenever adding a new pillar module or sub-routes, immediately register the path prefix in the layout route-watcher (e.g. `pathname.includes('/others')`). Otherwise, Zustand fails to update `activeTab`, falling back to the default tab (`main`) and hiding the newly added sidebar menu group from the user. |
| **Mixing Server & Client State** | Placing interactive state (`useState`, query hooks) in Server Components or fetching DB data in Client leaves | Follow `nextjs-best-practices`: Server parent for initial data fetch, Client leaf for interactive triggers (`"use client"`). |
| **Missing AI Blueprint Guardrails** | Relying on ad-hoc conversational instructions without grounding in structured repository docs | Mandate the 9-document AI Developer Documentation Kit pattern (`AGENTS.md`, `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `SECURITY.md`, `TESTING.md`, `DEPLOYMENT.md`, `TASK_INSTRUCTION.md`, `RULES.md`) so any agent operates with complete contextual clarity. |
| **Premature Code Modification Without Prior Plan Approval** | Jumping directly into modifying files upon receiving design or feature requests | Formulate a comprehensive implementation plan first (covering exact changes, files, styling/logic, and verification steps), report it to the user, and wait for explicit approval before touching any code. |
| **Ephemeral Quick Tunnels Breaking Live Demos & HMR** | Using random ephemeral quick tunnels (e.g. `trycloudflare.com` quick tunnels) which rotate URLs on restart and trigger Turbopack WebSocket failures | Establish a fixed demo URL via Subdomain Ingress (`*.octalectzz.my.id`), Cloudflare Named Tunnel (Zero Trust token), or Vercel CI/CD preview with WebSocket support enabled. |
| **Burying Primary Row Actions in Dropdowns** | Forcing users to click open a dropdown menu for frequent row actions (Edit, Archive, Delete) | Follow the `shadcn-admin` data table standard: render direct inline action buttons inside the table row cell for 1-click execution, reserving the 3-dots dropdown exclusively for auxiliary/overflow actions. |
| **Uncompiled Tailwind v4 Utilities** | Using `@import "tailwindcss";` in `globals.css` without registering the PostCSS plugin | Install `@tailwindcss/postcss` and create `postcss.config.mjs` registering `plugins: { "@tailwindcss/postcss": {} }`. Without this, utility classes fail to compile into CSS chunks, producing unstyled HTML. |
| **next-intl App Router 404 & Validator Errors** | Placing layout and pages directly under `src/app/` while `next-intl` uses `localePrefix: 'as-needed'` | Move localized layouts and pages into `src/app/[locale]/` dynamic route segments (e.g. `src/app/[locale]/layout.tsx`). The next-intl middleware rewrites unprefixed requests internally to `/[locale]/...`. |
| **Container OOM on Next.js 16 Turbopack Build** | Next.js 16 build spawns up to 15 concurrent workers compiling TypeScript and static pages, exceeding 2.5 GB RAM | Allocate at least 4 GB (`memory: 4096M`) to the development container in `compose.yaml` to prevent Exit Code 137 SIGKILL terminations. |
| **Missing TooltipProvider in App Shell** | Radix `Tooltip` in `SidebarMenuButton` lacks parent context | Wrap `<SidebarProvider>` with `<TooltipProvider delayDuration={0}>` in `authenticated-layout.tsx` to prevent `Error: Tooltip must be used within TooltipProvider`. |
| **Silent Form Submission Failure in Automated Probes** | Generic input value assignment does not trigger React synthetic event listeners | Dispatch native property descriptors (`Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set`) and trigger `'input'` event before submitting controlled forms. |
| **Misplaced 'use client' Directive Breaking Turbopack** | Placing `import` statements or expressions before `'use client'` | The `'use client'` directive must strictly reside on line 1 before ANY `import` or statement; otherwise Turbopack treats the module as a Server Component or fails compilation with `The "use client" directive must be placed before other expressions`. |
| **Unsupervised App Server Causing 502 Bad Gateway Post-Reboot** | Running `next start` via ad-hoc nohup/background commands inside container without a process supervisor | Host reboots restart Docker containers (`restart: unless-stopped`) but kill unsupervised background processes, closing the port and returning 502 Bad Gateway at the reverse proxy. Diagnose by checking host uptime and listening ports (`ECONNREFUSED`), and ensure persistent runtime supervision (PM2/compose service/entrypoint). |
