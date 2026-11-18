/**
 * supplier-type-schema.ts — Zod validation for the flat Supplier Type master
 * Syailendra Group ERP (SCM Pillar)
 */

import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils'

import type { SchemaTranslator } from '@/utils'

export function getSupplierTypeFormSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    name: z
      .string()
      .min(2, { message: msg('validation.nameMin', 'Type name must be at least 2 characters') })
      .max(100, { message: msg('validation.nameMax', 'Type name cannot exceed 100 characters') }),
    description: z
      .string()
      .max(500, { message: msg('validation.descriptionMax', 'Description cannot exceed 500 characters') })
      .optional(),
    sequence: z
      .number({ message: msg('validation.sequenceNumber', 'Sequence must be a number') })
      .int({ message: msg('validation.sequenceNumber', 'Sequence must be a number') })
      .min(1, { message: msg('validation.sequenceMin', 'Sequence must be at least 1') })
      .max(999, { message: msg('validation.sequenceMax', 'Sequence cannot exceed 999') }),
    active: z.boolean()
  })
}

export const supplierTypeFormSchema = getSupplierTypeFormSchema()
export type SupplierTypeFormSchemaValues = z.infer<typeof supplierTypeFormSchema>
