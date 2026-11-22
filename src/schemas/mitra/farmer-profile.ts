import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils/schema-helper'

import type { SchemaTranslator } from '@/utils/schema-helper'

const FARMING_SYSTEMS = ['conventional', 'organic', 'agroforestry'] as const
const LAND_OWNERSHIP = ['owned', 'rented', 'shared', 'certified'] as const

const isPositiveNumber = (value: string | number) => {
  const n = Number(value)
  return !isNaN(n) && n > 0
}

// Union (string | number) keeps zod input == output so react-hook-form v7 +
// zodResolver v4 type-checks. Number strings are coerced to numbers when the
// payload is assembled for submission.
const optNum = () => z.union([z.string(), z.number()]).optional()
const reqNum = () =>
  z.union([z.string(), z.number()]).refine(isPositiveNumber, {
    message: 'Land area must be a positive number'
  })

export function getFarmerProfileSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    nik: z.string().min(1, { message: msg('validation.nikRequired', 'NIK is required') }),
    name: z.string().min(1, { message: msg('validation.nameRequired', 'Farmer name is required') }),
    land_area_m2: reqNum(),
    estimated_yield_kg: optNum(),
    land_ownership: z.enum(LAND_OWNERSHIP).optional(),
    planted_date: z.string().optional(),
    farm_name: z.string().optional(),
    farm_farming_system: z.enum(FARMING_SYSTEMS).optional(),
    farm_area_ha: optNum(),
    farm_elevation_mdpl: optNum(),
    farm_latitude: optNum(),
    farm_longitude: optNum(),
    farm_google_maps_url: z.string().url().optional(),
    farm_uses_pesticide: z.boolean().optional(),
    farm_pesticide_types: z.string().optional(),
    farm_uses_herbicide: z.boolean().optional(),
    farm_herbicide_types: z.string().optional(),
    farm_fertilizer_types: z.string().optional(),
    farm_water_source: z.string().optional(),
    farm_land_history: z.string().optional()
  })
}

export type FarmerProfileValues = z.infer<ReturnType<typeof getFarmerProfileSchema>>
