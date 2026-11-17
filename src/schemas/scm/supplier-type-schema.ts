/**
 * supplier-type-schema.ts — Zod validation schema for Supplier Type
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
      .min(2, { message: msg('validation.nameMin', 'Category name must be at least 2 characters') })
      .max(100, { message: msg('validation.nameMax', 'Category name cannot exceed 100 characters') }),
    parentId: z.number().nullable(),
    color: z.number().int().min(0).max(11),
    active: z.boolean()
  })
}

export const supplierTypeFormSchema = getSupplierTypeFormSchema()
export type SupplierTypeFormSchemaValues = z.infer<typeof supplierTypeFormSchema>
