/**
 * supplier-schema.ts — Zod validation schema for Master Supplier
 * Syailendra Group ERP (SCM Pillar)
 */

import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils'

import type { SchemaTranslator } from '@/utils'

export function getSupplierFormSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    ref: z
      .string()
      .min(3, { message: msg('validation.refMin', 'Supplier code must be at least 3 characters') })
      .max(32, { message: msg('validation.refMax', 'Supplier code cannot exceed 32 characters') }),
    name: z
      .string()
      .min(3, { message: msg('validation.nameMin', 'Supplier name must be at least 3 characters') })
      .max(128, { message: msg('validation.nameMax', 'Supplier name cannot exceed 128 characters') }),
    isCompany: z.boolean(),
    companyType: z.enum(['company', 'person']),
    categoryIds: z.array(z.number()).min(1, { message: msg('validation.categoryRequired', 'At least one supplier category must be selected') }),
    contactName: z.string().max(64).optional(),
    phone: z.string().max(32).optional(),
    mobile: z.string().max(32).optional(),
    email: z
      .string()
      .email({ message: msg('validation.emailInvalid', 'Invalid email address format') })
      .optional()
      .or(z.literal('')),
    vat: z.string().max(32).optional(),
    countryId: z.number().nullable().optional(),
    stateId: z.number().nullable().optional(),
    districtId: z.number().nullable().optional(),
    subDistrictId: z.number().nullable().optional(),
    villageId: z.number().nullable().optional(),
    street: z.string().max(256).optional(),
    zip: z.string().max(10).optional(),
    paymentTerm: z.enum(['COD', 'PAID_BEFORE_SHIPMENT']),
    bankName: z.string().max(64).optional(),
    accountNumber: z.string().max(32).optional(),
    accountHolder: z.string().max(64).optional(),
    legacyCode: z.string().max(32).optional(),
    active: z.boolean()
  })
}

export const supplierFormSchema = getSupplierFormSchema()
export type SupplierFormSchemaValues = z.infer<typeof supplierFormSchema>
