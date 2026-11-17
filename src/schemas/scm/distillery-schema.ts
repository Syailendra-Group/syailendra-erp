/**
 * distillery-schema.ts — Zod validation schema for Distillation Facility Master
 * Syailendra Group ERP — SCM Pillar
 */

import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils/schema-helper'

import type { SchemaTranslator } from '@/utils/schema-helper'

export const DISTILLATION_METHODS = ['steam', 'water_dist', 'water_steam', 'hydrodiffusion', 'co2', 'cold_press', 'solvent', 'enfleurage'] as const

export const BOILER_MATERIALS = ['stainless_316', 'stainless_304', 'copper', 'mild_steel', 'galvanized'] as const

export const FUEL_TYPES = ['firewood', 'biomass', 'lpg', 'solar', 'electric'] as const

export function getDistilleryFormSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    id: z.number().int().positive().optional(),
    name: z
      .string()
      .min(3, { message: msg('validation.nameRequired', 'Facility name must be at least {min} characters', { min: 3 }) })
      .max(120, { message: msg('validation.nameMax', 'Facility name must be at most {max} characters', { max: 120 }) }),
    code: z
      .string()
      .min(3, { message: msg('validation.codeMin', 'Facility code must be at least {min} characters', { min: 3 }) })
      .max(20, { message: msg('validation.codeMax', 'Facility code must be at most {max} characters', { max: 20 }) })
      .regex(/^DST-[A-Z0-9]+-[0-9]+$/, {
        message: msg('validation.codeFormat', 'Format must follow DST-[WILAYAH]-[NO] (e.g. DST-JTG-002)')
      }),
    partner_id: z
      .number({ message: msg('validation.partnerRequired', 'Select the distiller / facility owner') })
      .int()
      .positive({ message: msg('validation.partnerRequired', 'Select the distiller / facility owner') }),
    state_id: z.number().int().positive().optional(),
    city_id: z.number().int().positive().optional(),
    district_id: z.number().int().positive().optional(),
    subdistrict_id: z.number().int().positive().optional(),
    address_detail: z
      .string()
      .max(1000, { message: msg('validation.addressDetailMax', 'Facility address must be at most {max} characters', { max: 1000 }) })
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
    facility_area_m2: z
      .number()
      .min(0, { message: msg('validation.nonNegative', 'Value cannot be negative') })
      .optional(),
    distillation_method: z.enum(DISTILLATION_METHODS, {
      message: msg('validation.methodRequired', 'Distillation method is required')
    }),
    boiler_count: z
      .number()
      .int({ message: msg('validation.boilerCountInteger', 'Boiler count must be a whole number') })
      .min(1, { message: msg('validation.boilerCountMin', 'At least one boiler is required', { min: 1 }) }),
    boiler_capacity_kg: z.number().min(0, { message: msg('validation.nonNegative', 'Value cannot be negative') }),
    boiler_material: z.enum(BOILER_MATERIALS, {
      message: msg('validation.materialRequired', 'Boiler material is required')
    }),
    fuel_type: z.enum(FUEL_TYPES, {
      message: msg('validation.fuelRequired', 'Fuel type is required')
    }),
    avg_duration_hours: z
      .number()
      .min(0, { message: msg('validation.nonNegative', 'Value cannot be negative') })
      .optional(),
    operating_temp_c: z
      .number()
      .min(0, { message: msg('validation.nonNegative', 'Value cannot be negative') })
      .optional(),
    operating_pressure_bar: z
      .number()
      .min(0, { message: msg('validation.nonNegative', 'Value cannot be negative') })
      .optional(),
    avg_yield_percent: z
      .number()
      .min(0, { message: msg('validation.nonNegative', 'Value cannot be negative') })
      .max(100, { message: msg('validation.yieldRange', 'Average yield must be between 0 and 100 percent') })
      .optional(),
    monthly_capacity_kg: z
      .number()
      .min(0, { message: msg('validation.nonNegative', 'Value cannot be negative') })
      .optional(),
    yearly_capacity_kg: z
      .number()
      .min(0, { message: msg('validation.nonNegative', 'Value cannot be negative') })
      .optional(),
    max_capacity_kg: z
      .number()
      .min(0, { message: msg('validation.nonNegative', 'Value cannot be negative') })
      .optional(),
    lead_time_days: z
      .number()
      .int({ message: msg('validation.leadTimeInteger', 'Lead time must be a whole number') })
      .min(0, { message: msg('validation.nonNegative', 'Value cannot be negative') })
      .optional(),
    moq_kg: z
      .number()
      .min(0, { message: msg('validation.nonNegative', 'Value cannot be negative') })
      .optional(),
    photo_distillery: z.string().nullable().optional(),
    active: z.boolean()
  })
}

export const distilleryFormSchema = getDistilleryFormSchema()
export type DistilleryFormValues = z.infer<typeof distilleryFormSchema>
