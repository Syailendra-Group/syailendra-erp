/**
 * farm-schema.ts — Zod validation schema for Farm / Terroir Master
 * Syailendra Group ERP (SCM Pillar)
 */

import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils/schema-helper'

import type { SchemaTranslator } from '@/utils/schema-helper'

export const FARMING_SYSTEMS = ['organic', 'semi_organic', 'conventional', 'agroforestry'] as const

export function getFarmFormSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    name: z
      .string()
      .min(1, { message: msg('validation.nameRequired', 'Farm block name is required') })
      .max(120, { message: msg('validation.nameMax', 'Farm block name must be at most 120 characters', { max: 120 }) }),
    code: z
      .string()
      .min(3, { message: msg('validation.codeMin', 'Farm code must be at least 3 characters', { min: 3 }) })
      .max(20, { message: msg('validation.codeMax', 'Farm code must be at most 20 characters', { max: 20 }) })
      .regex(/^[A-Za-z0-9-]+$/, { message: msg('validation.codeFormat', 'Farm code may only contain letters, numbers, and dashes') }),
    partner_id: z
      .number({ message: msg('validation.partnerRequired', 'Select the farm owner') })
      .int()
      .positive({ message: msg('validation.partnerRequired', 'Select the farm owner') }),
    crop_ids: z.array(z.number().int().positive(), {
      message: msg('validation.commoditiesRequired', 'Select at least one commodity')
    }),
    country_id: z.number().int().positive().optional(),
    state_id: z.number().int().positive().optional(),
    city_id: z.number().int().positive().optional(),
    district_id: z.number().int().positive().optional(),
    subdistrict_id: z.number().int().positive().optional(),
    address_detail: z
      .string()
      .max(1000, { message: msg('validation.addressDetailMax', 'Land address must be at most 1000 characters', { max: 1000 }) })
      .optional(),
    latitude: z
      .number()
      .min(-90, { message: msg('validation.latitudeRange', 'Latitude must be between -90 and 90') })
      .max(90, { message: msg('validation.latitudeRange', 'Latitude must be between -90 and 90') })
      .optional(),
    longitude: z
      .number()
      .min(-180, { message: msg('validation.longitudeRange', 'Longitude must be between -180 and 180') })
      .max(180, { message: msg('validation.longitudeRange', 'Longitude must be between -180 and 180') })
      .optional(),
    elevation_mdpl: z
      .number()
      .int({ message: msg('validation.elevationInteger', 'Elevation must be a whole number') })
      .min(0, { message: msg('validation.elevationMin', 'Elevation cannot be negative') })
      .optional(),
    area_ha: z
      .number()
      .min(0, { message: msg('validation.areaMin', 'Farm area cannot be negative') })
      .max(100000, { message: msg('validation.areaMax', 'Farm area is unrealistically large') })
      .optional(),
    farming_system: z.enum(FARMING_SYSTEMS, { message: msg('validation.farmingSystemRequired', 'Select the farming system') }),
    uses_pesticide: z.boolean(),
    pesticide_types: z
      .string()
      .max(255, { message: msg('validation.textMax', 'Must be at most {max} characters', { max: 255 }) })
      .optional(),
    uses_herbicide: z.boolean(),
    herbicide_types: z
      .string()
      .max(255, { message: msg('validation.textMax', 'Must be at most {max} characters', { max: 255 }) })
      .optional(),
    fertilizer_types: z
      .string()
      .max(255, { message: msg('validation.textMax', 'Must be at most {max} characters', { max: 255 }) })
      .optional(),
    water_source: z
      .string()
      .max(255, { message: msg('validation.textMax', 'Must be at most {max} characters', { max: 255 }) })
      .optional(),
    land_history: z
      .string()
      .max(4000, { message: msg('validation.landHistoryMax', 'Land history must be at most 4000 characters', { max: 4000 }) })
      .optional(),
    photo_farm: z.string().nullable().optional(),
    active: z.boolean()
  })
}

export const farmFormSchema = getFarmFormSchema()

export type FarmFormValues = z.infer<typeof farmFormSchema>
