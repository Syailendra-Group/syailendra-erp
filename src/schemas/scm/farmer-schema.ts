/**
 * farmer-schema.ts — Zod validation schema for Farmers & Plantations
 * Syailendra Group ERP — SCM Pillar
 */

import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils'

import type { SchemaTranslator } from '@/utils'

export function getFarmerFormSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    id: z.number().optional(),
    ref: z
      .string()
      .min(3, { message: msg('validation.refMin', 'Farmer ID must be at least 3 characters', { min: 3 }) })
      .regex(/^FMR-[A-Z0-9]+-[0-9]+$/, {
        message: msg('validation.refFormat', 'Format must follow FMR-[WILAYAH]-[NO_URUT] (e.g. FMR-JTG-003)')
      }),
    name: z.string().min(3, { message: msg('validation.nameRequired', 'Name must be at least 3 characters', { min: 3 }) }),
    vat: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    country_id: z.number().optional(),
    state_id: z.number().optional(),
    city_id: z.number().optional(),
    district_id: z.number().optional(),
    subdistrict_id: z.number().optional(),
    zip_code: z.string().optional(),
    address_detail: z.string().optional(),
    address_benchmark: z.string().optional(),
    street: z.string().min(2, { message: msg('validation.streetRequired', 'Village / plantation address is required') }),
    city: z.string().min(2, { message: msg('validation.cityRequired', 'Regency / district is required') }),
    partner_latitude: z.number().min(-90).max(90),
    partner_longitude: z.number().min(-180).max(180),
    commodity: z.string().min(1, { message: msg('validation.commodityRequired', 'Main commodity is required') }),
    farming_method: z.string(),
    land_area_m2: z.number().optional(),
    comment: z.string().optional()
  })
}

export const farmerFormSchema = getFarmerFormSchema()
export type FarmerFormValues = z.infer<typeof farmerFormSchema>
