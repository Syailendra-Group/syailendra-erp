/**
 * menu-schema.ts — Zod validation schema for Business Module Pillars
 * Syailendra Group ERP
 */

import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils/schema-helper'

import type { SchemaTranslator } from '@/utils/schema-helper'

export function createPillarSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    id: z.number().int().positive(),
    short_name: z
      .string()
      .min(2, { message: msg('validation.shortNameMin', 'Short name must be at least 2 characters') })
      .max(30, { message: msg('validation.shortNameMax', 'Short name cannot exceed 30 characters') }),
    name: z
      .string()
      .min(3, { message: msg('validation.nameMin', 'Menu name must be at least 3 characters') })
      .max(120, { message: msg('validation.nameMax', 'Menu name cannot exceed 120 characters') }),
    tagline: z.string().max(200),
    description: z.string().max(1000),
    company_id: z
      .number()
      .int()
      .positive({ message: msg('validation.companyRequired', 'Please select an owning entity') }),
    sequence: z.number().int().min(1).max(999)
  })
}

export const pillarSchema = createPillarSchema()
export type PillarFormValues = z.infer<typeof pillarSchema>
