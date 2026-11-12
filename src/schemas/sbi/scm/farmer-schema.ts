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
    email: z
      .string()
      .email({ message: msg('validation.emailInvalid', 'Invalid email address') })
      .optional()
      .or(z.literal('')),
    // Regional & Domicile Fields (Mandatory except address_benchmark)
    country_id: z.number({ message: msg('validation.countryRequired', 'Country is required') }).min(1, {
      message: msg('validation.countryRequired', 'Country is required')
    }),
    state_id: z.number({ message: msg('validation.provinceRequired', 'Province is required') }).min(1, {
      message: msg('validation.provinceRequired', 'Province is required')
    }),
    city_id: z.number({ message: msg('validation.cityRequired', 'Regency / city is required') }).min(1, {
      message: msg('validation.cityRequired', 'Regency / city is required')
    }),
    district_id: z.number({ message: msg('validation.districtRequired', 'District is required') }).min(1, {
      message: msg('validation.districtRequired', 'District is required')
    }),
    subdistrict_id: z.number({ message: msg('validation.villageRequired', 'Village is required') }).min(1, {
      message: msg('validation.villageRequired', 'Village is required')
    }),
    zip_code: z.string().min(3, { message: msg('validation.zipRequired', 'Postal code is required') }),
    address_detail: z.string().min(3, { message: msg('validation.addressDetailRequired', 'Detailed address is required') }),
    address_benchmark: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    partner_latitude: z
      .number({ message: msg('validation.latitudeRequired', 'GPS Latitude is required') })
      .min(-90)
      .max(90),
    partner_longitude: z
      .number({ message: msg('validation.longitudeRequired', 'GPS Longitude is required') })
      .min(-180)
      .max(180),
    // Agriculture & Plantation Fields
    commodity: z.string().min(1, { message: msg('validation.commodityRequired', 'Main commodity is required') }),
    farming_method: z.string(),
    land_area_m2: z.number().optional(),
    comment: z.string().optional(),
    legacy_code: z.string().optional()
  })
}

export const farmerFormSchema = getFarmerFormSchema()
export type FarmerFormValues = z.infer<typeof farmerFormSchema>
