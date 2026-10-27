# RULES.md — Engineering Standards & Operational Guidelines

> **Project:** ERP Syailendra Group  
> **Source Standard:** Owner (Octa) Engineering Mandate & AI POS Blueprint  
> **Last Updated:** 2026-10-27  
> **Status:** Strictly Enforced

---

## 1. Absolute Code Invariants

1. **Strict Language Rule:**
   - All code logic, variable names, functions, comments, commit messages, and documentation must be written in professional **English**.
2. **Zero Hardcoded UI Text:**
   - NEVER hardcode UI text strings in code. ALWAYS use `next-intl` translation keys (e.g. `t('auth.login.submit')`, `t('nav.inventory')`).
3. **UI Toolkit Enforcement:**
   - Exclusively use **shadcn/ui** and **Tailwind CSS**. No inline styles for static values.
4. **Clean Code & DRY:**
   - If a component or logic block is used in $\ge 2$ places, it MUST be extracted into a reusable component in `/src/components/shared/` or `/src/components/ui/`.
5. **Hard File Line Limit (< 300 Lines):**
   - No single file may exceed **300 lines of code**. Decompose complex files into sub-components, sub-hooks, or modular sections.
6. **Uniform Component Ordering & Syntax:**
   - Every file must follow the exact same structural ordering:
     1. Imports (External > Internal absolute `@/...` > Relative > Types)
     2. Types & Interfaces (Props definitions)
     3. Constants & Static Configurations
     4. Main Component Definition (Named export)
     5. Hooks (`useQuery`, `useNavStore`, `useState`, `useForm`)
     6. Handlers & Derived Calculations
     7. Return JSX Block
     8. Sub-components or private helpers

---

## 2. Mandatory Folder Architecture

```
/src/
  ├── app/                  # Next.js App Router routing leaves & layouts only
  ├── features/             # Feature slices: e.g. /src/features/auth/login/{index.tsx, form.tsx}
  ├── components/
  │    ├── ui/              # shadcn/ui primitives only
  │    ├── layout/          # App shell primitives (app-sidebar, header, nav-group, nav-user)
  │    └── shared/          # Reusable shared components across features
  ├── providers/            # All React providers (/src/providers/theme-provider.tsx, etc.)
  ├── hooks/                # Custom React hooks only
  ├── types/                # Global TypeScript declarations & interfaces
  ├── schemas/              # Zod validation schemas
  ├── stores/               # Zustand global state stores
  ├── lib/                  # Library wrappers, Odoo client SDK, utils
  └── messages/             # Modular bilingual dictionaries:
       ├── id/              # Indonesian translations by domain
       │    ├── common/
       │    ├── auth/
       │    └── inventory/
       └── en/              # English translations by domain
            ├── common/
            ├── auth/
            └── inventory/
```

---

## 3. Strict Pre-Commit Verification Gate

Before committing, `npm run lint` automatically executes an all-in-one verification gate:
1. `npm run typecheck` (`tsc --noEmit` — Zero TypeScript errors allowed)
2. `eslint` (Strict ESLint v9 checks)
3. `prettier --check` (Prettier code style & Tailwind class order)

If any check fails, the commit is strictly rejected.

---

## 4. Pre-Implementation Reading Rule

Before writing or altering any project files:
1. Read `.skills/` in the project root.
2. Query **MCP Context7** for verified syntax and documentation.
3. Update this rules document whenever new owner mandates arrive.
