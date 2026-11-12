/**
 * schema-helper.ts — Reusable i18n message resolver & schema enhancers for Zod
 * Syailendra Group ERP
 */

import { z } from 'zod'

export type SchemaTranslator = (key: string, values?: Record<string, string | number>) => string

export type SchemaMessageResolver = (key: string, fallback: string, values?: Record<string, string | number>) => string

/**
 * Creates a safe, localized message resolver function from a next-intl translator.
 * If translator `t` is omitted (e.g. server-side actions, background jobs),
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

/**
 * Enhances any Zod object schema with a standardized Cloudflare Turnstile token verification rule.
 * Eliminates repetitive turnstile field definitions across multiple application forms.
 */
export function withTurnstileSchema<T extends z.ZodRawShape>(baseSchema: z.ZodObject<T>, t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)
  return baseSchema.extend({
    turnstileToken: z.string().min(1, { message: msg('validation.turnstileRequired', 'Please complete the security verification') })
  })
}
