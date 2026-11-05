/**
 * regency-schema.ts — Zod validation schema for Regencies
 * Syailendra Group ERP
 */

import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils'

import type { SchemaTranslator } from '@/utils'

export function getRegencyFormSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    id: z.number().optional(),
    name: z.string().min(2, { message: msg('validation.nameRequired', 'Name is required', { min: 2 }) }),
    code: z.string().optional(),
    alias: z.string().min(1, { message: msg('validation.aliasRequired', 'Alias name is required', { min: 1 }) }),
    description: z.string().optional(),
    is_domestic: z.boolean(),
    country_id: z.number().optional(),
    state_id: z.number().optional(),
    province_name_raw: z.string().optional(),
    province_code_raw: z.string().optional(),
    auto_add_province: z.boolean(),
    latitude: z.number().optional(),
    longitude: z.number().optional()
  })
}

export const regencyFormSchema = getRegencyFormSchema()
export type RegencyFormValues = z.infer<typeof regencyFormSchema>
