import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils/schema-helper'

import type { SchemaTranslator } from '@/utils/schema-helper'

const HARVEST_CONDITION = ['good', 'average', 'poor'] as const

const optNum = () => z.union([z.string(), z.number()]).optional()
const reqNum = () =>
  z.union([z.string(), z.number()]).refine(
    (value) => {
      const n = Number(value)
      return !isNaN(n) && n > 0
    },
    { message: 'Wet weight must be a positive number' }
  )

export function getFarmerHarvestSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    farm_id: z.string().min(1, { message: msg('validation.farmIdRequired', 'Farm ID is required') }),
    crop_id: z.string().min(1, { message: msg('validation.cropIdRequired', 'Crop ID is required') }),
    harvest_date: z.string().min(1, {
      message: msg('validation.harvestDateRequired', 'Harvest date is required')
    }),
    wet_weight_kg: reqNum(),
    initial_moisture_pct: optNum(),
    harvest_condition: z.enum(HARVEST_CONDITION).optional(),
    quality_notes: z.string().optional(),
    operator_name: z.string().optional()
  })
}

export type FarmerHarvestValues = z.infer<ReturnType<typeof getFarmerHarvestSchema>>
