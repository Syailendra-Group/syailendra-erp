/**
 * commodity-schema.ts — Zod validation schema for Commodity Master
 * Syailendra Group ERP (SCM Pillar)
 */

import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils/schema-helper'

import type { SchemaTranslator } from '@/utils/schema-helper'

export const PLANT_PARTS = ['leaves', 'rhizome', 'wood', 'bark', 'seeds', 'flowers', 'fruit', 'roots'] as const
export const CULTIVATION_STATUSES = ['cultivated', 'wild'] as const

export function getCommodityFormSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    code: z
      .string()
      .min(1, { message: msg('validation.codeRequired', 'Commodity code is required') })
      .max(10, { message: msg('validation.codeMax', 'Commodity code must be at most 10 characters', { max: 10 }) })
      .regex(/^[A-Za-z0-9]+$/, { message: msg('validation.codeAlphanumeric', 'Commodity code must be letters and numbers only') }),
    name: z
      .string()
      .min(1, { message: msg('validation.nameRequired', 'Local name is required') })
      .max(120, { message: msg('validation.nameMax', 'Local name must be at most 120 characters', { max: 120 }) }),
    latin_name: z
      .string()
      .min(1, { message: msg('validation.latinNameRequired', 'Botanical name is required') })
      .max(160, { message: msg('validation.latinNameMax', 'Botanical name must be at most 160 characters', { max: 160 }) }),
    plant_part: z.enum(PLANT_PARTS, { message: msg('validation.plantPartRequired', 'Select the distilled plant part') }),
    cultivation_status: z.enum(CULTIVATION_STATUSES, { message: msg('validation.cultivationStatusRequired', 'Select the resource status') }),
    lifespan_months: z
      .number()
      .int({ message: msg('validation.lifespanInteger', 'Productive lifespan must be a whole number of months') })
      .min(0, { message: msg('validation.lifespanMin', 'Productive lifespan cannot be negative') })
      .max(600, { message: msg('validation.lifespanMax', 'Productive lifespan must be at most 600 months', { max: 600 }) })
      .optional(),
    harvest_season: z
      .string()
      .max(120, { message: msg('validation.harvestSeasonMax', 'Harvest season must be at most 120 characters', { max: 120 }) })
      .optional(),
    harvest_frequency: z
      .string()
      .max(120, { message: msg('validation.harvestFrequencyMax', 'Harvest frequency must be at most 120 characters', { max: 120 }) })
      .optional(),
    description: z
      .string()
      .max(2000, { message: msg('validation.descriptionMax', 'Agronomy notes must be at most 2000 characters', { max: 2000 }) })
      .optional(),
    active: z.boolean()
  })
}

export const commodityFormSchema = getCommodityFormSchema()

export type CommodityFormValues = z.infer<typeof commodityFormSchema>
