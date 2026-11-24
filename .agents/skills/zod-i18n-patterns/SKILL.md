---
name: zod-i18n-patterns
description: "Use when creating localized Zod schemas with next-intl."
version: 1.2.0
author: "Octa Hub"
license: MIT
metadata:
  hermes:
    tags: [zod, i18n, next-intl, react-hook-form, schema-factory, zero-hardcoded]
---

# Zod Schema Internationalization & React Hook Form Integration

Standardized architecture for internationalizing Zod schemas in Next.js App Router applications with `next-intl`, `@hookform/resolvers/zod`, and centralized helper utilities.

## 1. The Core Problem
Hardcoded static validation error messages inside schemas (e.g. `.min(3, { message: 'Must be 3 characters' })`):
- Exclude non-English users because `<FormMessage />` displays static English.
- Violate the Zero Hardcoded UI Text mandate.
- Inlined `msg` helper boilerplate duplicated across multiple schema files violates DRY.

## 2. Centralized Helper Utility (`src/utils/schema-helper.ts`)
To eliminate boilerplate across all schemas, always centralize the translator type and message resolver helper into `@/utils/schema-helper.ts` (re-exported via `@/utils`):

```typescript
/**
 * schema-helper.ts — Reusable i18n message resolver for Zod schemas
 * Syailendra Group ERP
 */

export type SchemaTranslator = (key: string, values?: Record<string, string | number>) => string

export type SchemaMessageResolver = (
  key: string,
  fallback: string,
  values?: Record<string, string | number>
) => string

/**
 * Creates a safe, localized message resolver function from a next-intl translator.
 * If translator `t` is omitted (e.g. server actions, background tasks),
 * it returns the fallback English string cleanly.
 */
export function createSchemaMessageResolver(t?: SchemaTranslator): SchemaMessageResolver {
  return (key: string, fallback: string, values?: Record<string, string | number>) => {
    if (t) {
      try {
        return t(key, values)
      } catch {
        return fallback
      }
    }
    return fallback
  }
}
```

## 3. Schema Factory Pattern (`getFormSchema(t)`)
In every schema file, import `createSchemaMessageResolver` from `@/utils` and export a factory function that accepts an optional translator function `t`, alongside a default pre-instantiated schema for server-side parsing:

```typescript
import { z } from 'zod'
import { createSchemaMessageResolver, type SchemaTranslator } from '@/utils'

export function getMyFormSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    code: z
      .string()
      .min(3, { message: msg('validation.codeMin', 'Code must be at least 3 characters', { min: 3 }) })
      .regex(/^[A-Z]{2,4}-[0-9]+$/, {
        message: msg('validation.codeFormat', 'Format must follow [PREFIX]-[NO]')
      }),
    name: z.string().min(1, { message: msg('validation.nameRequired', 'Name is required') }),
    capacity: z.number().positive({ message: msg('validation.capacityPositive', 'Capacity must be positive') })
  })
}

// Default instance for Server Actions, API routes, and type inference
export const myFormSchema = getMyFormSchema()
export type MyFormValues = z.infer<typeof myFormSchema>
```

## 4. UI Form Usage (Client Component)
In React Hook Form components, pass the translation function to `zodResolver`:

```typescript
'use client'

import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getMyFormSchema } from '@/schemas/my-schema'
import type { MyFormValues } from '@/schemas/my-schema'

export function MyForm() {
  const t = useTranslations('myDomain')

  const form = useForm<MyFormValues>({
    resolver: zodResolver(getMyFormSchema(t)),
    defaultValues: ...
  })
  // ...
}
```

## 5. Critical Pitfall: `z.coerce` vs `@hookform/resolvers/zod`
When using `zodResolver(schema)` with `useForm<FormValues>`:
- `z.coerce.number()` produces `z.input = unknown` and `z.output = number`.
- `@hookform/resolvers/zod` enforces `Resolver<TInput, any, TOutput>`. Because `z.input` is `unknown`, it mismatches `useForm<FormValues>` where the field is `number`, causing TypeScript error:
  `Type 'unknown' is not assignable to type 'number'`.
- **Rule:** In React Hook Form schemas, ALWAYS use `z.number()` directly (with numeric conversion handled by `<input type="number">` or custom select components), avoiding `z.coerce.number()`.

## 6. Critical Pitfall: `.default(...)` in Schemas vs `useForm<FormValues>` Type Invariance
When `.default('val')` is attached to a field in a Zod schema (e.g. `hs_code: z.string().default('3301.29.90')`):
- `z.input` treats the field as optional (`string | undefined`) because the default supplies the value if omitted.
- `z.output` (`z.infer`) treats the field as required (`string`).
- `@hookform/resolvers/zod` expects `TInput` to match `TFieldValues`. When `useForm<FormValues>` has the field as strictly `string`, TypeScript flags a type variance mismatch: `Type 'string | undefined' is not assignable to type 'string'`, causing cascading `TFieldValues` errors on `handleSubmit` and `<FormField control={...} />`.
- **Rule:** NEVER attach `.default(...)` inside Zod schema fields when the schema is used with React Hook Form. Enforce the field strictly in Zod (`z.string().min(1, ...)` or `z.number().min(1, ...)`), and supply initial values via `useForm({ defaultValues: { ... } })`.

## 7. Dictionary Parity Mandate
All validation messages must be mirrored symmetrically in `messages/id/*.json` and `messages/en/*.json` under the `validation.*` namespace.

## 8. Mandatory Form-Schema Required Parity Contract
Any form field marked as required in the UI (with an asterisk `*` or `required={true}` on `FormFieldWrapper`) MUST be strictly required in the Zod schema (`z.number().min(1)` or `z.string().min(1)`), and vice versa. An optional schema field on a required UI control (or vice versa) creates silent validation divergence and confusing user experience.

## 9. Odoo Nullish / False Field Coalescing in RHF defaultValues
Odoo ORM returns boolean `false` for empty scalar or relational fields (`partner_latitude = false`, `city_id = false`).
- Using the nullish coalescing operator `??` (e.g. `initialData?.partner_latitude ?? -7.2145`) evaluates to `false` because `false` is not `null` or `undefined`.
- Passing boolean `false` to a numeric field inside React Hook Form `defaultValues` breaks `useForm<FormValues>` generic type inference, causing TypeScript to poison `TFieldValues` to `FieldValues` and triggering TS2345 `SubmitHandler` errors on `handleSubmit`.
- **Rule:** Always guard Odoo values explicitly before passing to `defaultValues`:
  `typeof initialData?.partner_latitude === 'number' ? initialData.partner_latitude : DEFAULT_LAT`
  `initialData?.city_id && Array.isArray(initialData.city_id) ? initialData.city_id[0] : DEFAULT_CITY_ID`
