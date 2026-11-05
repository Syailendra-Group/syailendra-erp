/**
 * province-schema.ts — Zod validation schema for Provinces
 * Syailendra Group ERP
 */

import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils'

import type { SchemaTranslator } from '@/utils'

export function getProvinceFormSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    id: z.number().optional(),
    is_domestic: z.boolean(),
    name: z.string().min(2, { message: msg('validation.nameRequired', 'Province name is required', { min: 2 }) }),
    code: z.string().min(1, { message: msg('validation.codeRequired', 'Province code is required', { min: 1 }) }),
    country_id: z.number().min(1, { message: msg('validation.countryRequired', 'Country is required') }),
    alias: z.string().optional(),
    description: z.string().optional()
  })
}

export const provinceFormSchema = getProvinceFormSchema()
export type ProvinceFormValues = z.infer<typeof provinceFormSchema>
