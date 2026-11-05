/**
 * schema-helper.ts — Reusable i18n message resolver for Zod schemas
 * Syailendra Group ERP
 */

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
