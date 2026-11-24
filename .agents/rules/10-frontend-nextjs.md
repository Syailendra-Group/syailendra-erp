---
trigger: glob
globs: "src/app/**, src/features/**, src/components/**"
description: Next.js 16 App Router conventions for routes, features, and shared components.
---

# Frontend Rules (Next.js 16 App Router)

- Route files stay thin; compose UI from `src/features/<pillar>/<feature>/`.
- Server Components are the default. Add `'use client'` only at the smallest
  interactive boundary; `'use client'` must be the first line of the file.
- `src/proxy.ts` is the request interception entry point in Next.js 16. Do not add a
  `middleware.ts`.
- Validate every server action and route handler input with Zod, independently of the
  client form.
- Authenticate and authorize each server action; never rely on UI visibility for access
  control, and never trust a client-supplied company or owner identifier.
- Operational ERP reads must not be cached across users/companies; scope caching
  explicitly and revalidate only the affected paths after mutations.
- Provide `loading.tsx`, `error.tsx`, and empty/error states for data-driven routes.
- Dashboard tables use the project data-table stack with URL query state as the source
  of truth for paging, filters, and sorting; filters are server-side.
- Keep files under 300 lines and prefer reusable components in `src/components/`.
- Use `next/image` for images and avoid Node-only APIs in Edge runtime code.
