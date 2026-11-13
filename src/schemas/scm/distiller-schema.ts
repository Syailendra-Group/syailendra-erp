/**
 * distiller-schema.ts — Zod validation schema for Distillation Units
 * Syailendra Group ERP — SCM Pillar
 */

import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils'

import type { SchemaTranslator } from '@/utils'

export function getDistillerFormSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    id: z.number().optional(),
    ref: z
      .string()
      .min(3, { message: msg('validation.refMin', 'Distiller ID must be at least 3 characters', { min: 3 }) })
      .regex(/^DST-[A-Z0-9]+-[0-9]+$/, {
        message: msg('validation.refFormat', 'Format must follow DST-[WILAYAH]-[NO_URUT] (e.g. DST-JTG-002)')
      }),
    name: z.string().min(3, { message: msg('validation.nameRequired', 'Unit / facility name must be at least 3 characters', { min: 3 }) }),
    boiler_capacity_kg: z.number().positive({ message: msg('validation.capacityPositive', 'Boiler capacity must be positive') }),
    method: z.string().min(1, { message: msg('validation.methodRequired', 'Distillation method is required') }),
    boiler_material: z.string(),
    ownership: z.string(),
    operator_name: z.string().min(2, { message: msg('validation.operatorRequired', 'Operator name is required', { min: 2 }) }),
    phone: z.string().optional(),
    city: z.string().min(2, { message: msg('validation.cityRequired', 'City / regency is required') }),
    street: z.string().min(2, { message: msg('validation.streetRequired', 'Facility address is required') }),
    partner_latitude: z.number().optional(),
    partner_longitude: z.number().optional(),
    sanitation_status: z.string(),
    comment: z.string().optional()
  })
}

export const distillerFormSchema = getDistillerFormSchema()
export type DistillerFormValues = z.infer<typeof distillerFormSchema>
