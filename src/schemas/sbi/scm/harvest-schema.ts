/**
 * harvest-schema.ts — Zod validation schema factory for Field Harvest Sessions
 * Syailendra Group ERP (SCM Pillar)
 * Complies with octadev-coding-rules-v84 (Rule 77, 78, 79)
 */

import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils'

import type { SchemaTranslator } from '@/utils'

export function getHarvestFormSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    ref: z
      .string()
      .min(3, msg('validation.refMin', 'Harvest code must be at least 3 characters'))
      .max(32, msg('validation.refMax', 'Harvest code cannot exceed 32 characters')),
    name: z
      .string()
      .min(3, msg('validation.lotMin', 'Lot number must be at least 3 characters'))
      .max(32, msg('validation.lotMax', 'Lot number cannot exceed 32 characters')),
    productId: z.number().min(1, msg('validation.commodityRequired', 'Essential oil commodity must be selected')),
    partnerId: z.number().min(1, msg('validation.farmerRequired', 'Farmer or supplier must be selected')),
    harvestDate: z.string().min(1, msg('validation.dateRequired', 'Harvest date is required')),
    netWeightKg: z.number().min(0.1, msg('validation.weightMin', 'Scale weight must be at least 0.1 Kg')),
    moisturePercent: z.number().min(0).max(100).nullable().optional(),
    expectedYieldPercent: z.number().min(0).max(100).nullable().optional(),
    plantationLocation: z.string().max(128).optional(),
    gpsLatitude: z.number().min(-90).max(90).nullable().optional(),
    gpsLongitude: z.number().min(-180).max(180).nullable().optional(),
    status: z.enum(['received', 'ready', 'distilled', 'cancelled']),
    notes: z.string().max(500).optional()
  })
}

export const harvestFormSchema = getHarvestFormSchema()
export type HarvestFormSchemaValues = z.infer<typeof harvestFormSchema>
