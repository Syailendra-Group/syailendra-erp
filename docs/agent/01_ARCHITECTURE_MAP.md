# 01 — Architecture Map

## Runtime topology

```
Developer browser ──> code-server (VS Code Web, container) ──> repo on host
                              │
User browser ──> edge proxy (Caddy) ──> next-server :3000 (production build)
                              │
                              ├──> Odoo 18 CE (JSON-RPC 2.0) ──> PostgreSQL
                              └──> Object storage (S3 protocol) for media bytes
```

| Component | Responsibility |
| :--- | :--- |
| Next.js app | UI, server components, server actions, API route handlers |
| `src/proxy.ts` | Next.js 16 proxy (replaces `middleware.ts`) for auth and locale routing |
| Server actions | Mutations from forms; session-checked; revalidate targeted routes |
| API route handlers | File streaming, partner portal endpoints, MCP-facing endpoints |
| Odoo 18 | Business logic, ORM, stock, lots, sequences, ACL, multi-company |
| Object storage | Binary media (image, document, video) behind an S3-compatible API |

## Frontend layers

| Layer | Path | Rule |
| :--- | :--- | :--- |
| Routes | `src/app/[locale]/(dashboard)/<pillar>/...` | Routing leaves and layouts only |
| Features | `src/features/<pillar>/<feature>/` | UI composition, tables, dialogs, forms |
| Services | `src/services/odoo/<pillar>/` | JSON-RPC calls, field maps, domain builders |
| Actions | `src/actions/<pillar>/` | `"use server"` mutations with `revalidatePath` |
| Hooks | `src/hooks/<pillar>/` | TanStack Query wrappers |
| Schemas | `src/schemas/<pillar>/` | Zod schemas with i18n message resolvers |
| Types | `src/types/<pillar>/` | All shared types; no inline domain types in features |
| Messages | `src/messages/{id,en}/<pillar>/` | Symmetric translation dictionaries |
| Components | `src/components/` | Reusable primitives (ui, form, data-table, map, image, text) |

## Data flow rules

1. Server reads: feature or service fetches from Odoo on the server; never in a
   client component unless the interaction requires it.
2. Client tables: TanStack Query drives dashboard tables; URL query state is the
   single source of truth for pagination, filters, and sorting.
3. Mutations: form → server action → Odoo JSON-RPC → targeted `revalidatePath`.
4. Multi-company: every operational RPC passes
   `context: { allowed_company_ids: [activeCompanyId] }`.
5. Archived records stay visible where history matters: pass
   `context: { active_test: false }` explicitly.

## Backend addons

| Addon | Purpose |
| :--- | :--- |
| `syailendra_scm` | SCM, traceability, quality, compliance, partner portal |
| `syailendra_region` | Indonesian administrative regions (country, province, city, district, subdistrict) |

## Security boundaries

| Boundary | Control |
| :--- | :--- |
| Dashboard routes | Session cookie checked by the proxy and by each server action |
| Partner portal | Dedicated partner session; ownership checked per record |
| Public trace page | Read-only projection with company-sensitive fields stripped |
| Media streaming | Session plus entity ownership before streaming bytes |
| Odoo access | Dedicated integration account; read-only where possible |

## Environments

| Environment | Notes |
| :--- | :--- |
| Local (inside container) | Node binaries are available on the container PATH only |
| Demo | Production build served by `next-server`; reachable through the edge proxy |
| Odoo backend | Remote host, database `syailendra_erp`, addon deployed from the repo tree |

> Host names, IPs, and credentials are intentionally not recorded here. Runtime
> targets are resolved from environment configuration; ask the owner for access
> details instead of hardcoding them into a document.
