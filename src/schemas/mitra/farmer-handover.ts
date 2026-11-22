import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils/schema-helper'

import type { SchemaTranslator } from '@/utils/schema-helper'

const optNum = () => z.union([z.string(), z.number()]).optional()

export function getFarmerHandoverSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    harvest_id: z.string().min(1, {
      message: msg('validation.harvestIdRequired', 'Harvest ID is required')
    }),
    receiver: z.string().optional(),
    quantity: optNum(),
    note: z.string().optional()
  })
}

export type FarmerHandoverValues = z.infer<ReturnType<typeof getFarmerHandoverSchema>>
