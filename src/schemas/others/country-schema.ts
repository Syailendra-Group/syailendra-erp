/**
 * country-schema.ts — Zod validation schema for Countries
 * Syailendra Group ERP
 */

import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils'

import type { SchemaTranslator } from '@/utils'

export function getCountryFormSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    id: z.number().optional(),
    name: z.string().min(2, { message: msg('validation.nameRequired', 'Country name is required', { min: 2 }) }),
    code: z
      .string()
      .min(2, { message: msg('validation.codeMin', 'Country code must be at least 2 characters', { min: 2 }) })
      .max(5, { message: msg('validation.codeMax', 'Country code must be at most 5 characters', { max: 5 }) })
      .toUpperCase(),
    phone_code: z.number().optional(),
    description: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional()
  })
}

export const countryFormSchema = getCountryFormSchema()
export type CountryFormValues = z.infer<typeof countryFormSchema>
