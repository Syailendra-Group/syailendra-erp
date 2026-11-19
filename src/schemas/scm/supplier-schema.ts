/**
 * supplier-schema.ts — Zod validation schema for Master Supplier
 * Syailendra Group ERP (SCM Pillar)
 */

import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils'

import type { SchemaTranslator } from '@/utils'

export function getSupplierFormSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)
  const maxLen = (max: number) => msg('validation.maxLength', `Maximum ${max} characters`, { max })
  const intMsg = msg('validation.integer', 'Must be a whole number')
  const minZero = msg('validation.minValue', 'Cannot be negative', { min: 0 })

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
    supplierTypeId: z.number().nullable().optional(),
    supplierTypeVerified: z.boolean(),
    supplierStatus: z.enum(['active', 'inactive', 'pending', 'blacklisted']),
    ownerName: z
      .string()
      .max(64, { message: maxLen(64) })
      .optional(),
    picName: z
      .string()
      .max(64, { message: maxLen(64) })
      .optional(),
    picPosition: z
      .string()
      .max(64, { message: maxLen(64) })
      .optional(),
    joinYear: z
      .number()
      .int({ message: msg('validation.joinYearRange', 'Join year must be a 4-digit year') })
      .min(1900, { message: msg('validation.joinYearRange', 'Join year must be a 4-digit year') })
      .max(2100, { message: msg('validation.joinYearRange', 'Join year must be a 4-digit year') })
      .optional(),
    nib: z
      .string()
      .max(30, { message: maxLen(30) })
      .optional(),
    businessLicense: z
      .string()
      .max(64, { message: maxLen(64) })
      .optional(),
    phone: z
      .string()
      .max(32, { message: maxLen(32) })
      .optional(),
    mobile: z
      .string()
      .max(32, { message: maxLen(32) })
      .optional(),
    email: z
      .string()
      .email({ message: msg('validation.emailInvalid', 'Invalid email address format') })
      .optional()
      .or(z.literal('')),
    website: z
      .string()
      .max(128, { message: maxLen(128) })
      .optional(),
    vat: z
      .string()
      .max(32, { message: maxLen(32) })
      .optional(),
    nik: z
      .string()
      .max(32, { message: maxLen(32) })
      .optional(),
    countryId: z.number().nullable().optional(),
    stateId: z.number().nullable().optional(),
    cityId: z.number().nullable().optional(),
    districtId: z.number().nullable().optional(),
    subDistrictId: z.number().nullable().optional(),
    street: z
      .string()
      .max(256, { message: maxLen(256) })
      .optional(),
    addressDetail: z
      .string()
      .max(1000, { message: maxLen(1000) })
      .optional(),
    addressBenchmark: z
      .string()
      .max(256, { message: maxLen(256) })
      .optional(),
    zip: z
      .string()
      .max(10, { message: maxLen(10) })
      .optional(),
    latitude: z
      .number()
      .min(-90, { message: msg('validation.coordinateRange', 'Latitude must be between -90 and 90') })
      .max(90, { message: msg('validation.coordinateRange', 'Latitude must be between -90 and 90') })
      .optional(),
    longitude: z
      .number()
      .min(-180, { message: msg('validation.coordinateRange', 'Longitude must be between -180 and 180') })
      .max(180, { message: msg('validation.coordinateRange', 'Longitude must be between -180 and 180') })
      .optional(),
    farmerCount: z.number().int({ message: intMsg }).min(0, { message: minZero }).optional(),
    workerCount: z.number().int({ message: intMsg }).min(0, { message: minZero }).optional(),
    femaleWorkerPct: z
      .number()
      .min(0, { message: msg('validation.percentageRange', 'Percentage must be between 0 and 100') })
      .max(100, { message: msg('validation.percentageRange', 'Percentage must be between 0 and 100') })
      .optional(),
    noChildLabor: z.boolean(),
    fairWage: z.boolean(),
    wasteManagement: z
      .string()
      .max(500, { message: maxLen(500) })
      .optional(),
    renewableEnergy: z.boolean(),
    paymentTerm: z.enum(['COD', 'PAID_BEFORE_SHIPMENT']),
    bankName: z
      .string()
      .max(64, { message: maxLen(64) })
      .optional(),
    accountNumber: z
      .string()
      .max(32, { message: maxLen(32) })
      .optional(),
    accountHolder: z
      .string()
      .max(64, { message: maxLen(64) })
      .optional(),
    legacyCode: z
      .string()
      .max(32, { message: maxLen(32) })
      .optional(),
    active: z.boolean()
  })
}

export const supplierFormSchema = getSupplierFormSchema()
export type SupplierFormSchemaValues = z.infer<typeof supplierFormSchema>
