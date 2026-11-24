# Next.js Standards (App Router, v16)

## Project-specific baseline

The project is Next.js 16 App Router. Use the actual installed package versions in
`package.json` and official Next.js docs for version-sensitive behavior.

## Routing and rendering

- Keep `page.tsx` and route layouts thin; compose the feature from `src/features/`.
- React Server Components are the default. Add `'use client'` only at the smallest
  interactive boundary (forms, client tables, browser APIs).
- `src/proxy.ts` is the request interception entry point in Next 16; do not introduce
  `middleware.ts`.
- Use `loading.tsx`, `error.tsx`, and `not-found.tsx` where routes require them.
- Use metadata exports / `generateMetadata`; public trace pages must not leak private
  entity, supplier, or commercial information through metadata.

## Data and mutations

- Do not call Odoo directly from browser code. Use server-side services/actions.
- Validate untrusted input with Zod in the server action or route handler, even if the
  client form has already validated it.
- Authenticate and authorize each server action independently; UI visibility is not
  authorization.
- For JSON-RPC calls, validate response shape and convert Odoo faults into typed,
  user-safe errors; never return raw server traces to the browser.
- Specify caching explicitly. Operational ERP data is user/company-specific: prefer
  `no-store` or correctly scoped caching and targeted revalidation.

## Runtime and performance

- Avoid Node-only APIs in Edge runtime; only opt into Edge after compatibility tests.
- Use `next/image` for managed images and explicit dimensions/size hints.
- Dynamically import large maps, PDF, chart, and rich-editor libraries if they are not
  needed on initial render.
- Avoid `useEffect` for server state; use the project query layer for interactive data.
- Keep server actions small, typed, and auditable.
