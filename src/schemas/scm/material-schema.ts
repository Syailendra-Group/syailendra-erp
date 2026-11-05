/**
 * material-schema.ts — Zod validation schema for Material Master
 * Syailendra Group ERP — SCM Pillar
 */

import { z } from 'zod'
import { createSchemaMessageResolver, type SchemaTranslator } from '@/utils'

export function getMaterialFormSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    id: z.number().optional(),
    default_code: z
      .string()
      .min(3, { message: msg('validation.defaultCodeMin', 'Code must be at least 3 characters', { min: 3 }) })
      .regex(/^[A-Z]{2,4}-[A-Z0-9]+-[0-9]+$/, {
        message: msg('validation.defaultCodeFormat', 'Format must follow [PREFIX]-[CODE]-[NO] (e.g. EO-CDW-042 or RAW-PAT-001)')
      }),
    name: z.string().min(3, { message: msg('validation.nameRequired', 'Official name is required') }),
    commercial_name: z.string().optional(),
    category: z.enum([
      'essential_oils',
      'natural_isolates',
      'carrier_oils',
      'hydrosols',
      'raw_biomass',
      'packaging'
    ]),
    botanical_name: z.string().optional(),
    family: z.string().optional(),
    inci_name: z.string().optional(),
    cas_number: z.string().optional(),
    einecs_number: z.string().optional(),
    fema_number: z.string().optional(),
    hs_code: z.string().min(1, { message: msg('validation.hsCodeRequired', 'HS Code is required') }),
    plant_part: z.string().optional(),
    extraction_method: z.enum([
      'steam_distillation',
      'hydro_distillation',
      'cold_pressed',
      'solvent_extraction',
      'fractional_distillation',
      'none'
    ]),
    aroma_note: z.enum(['top', 'middle', 'base', 'fixative']).optional(),
    shelf_life_months: z.number().min(1, { message: msg('validation.shelfLifeMin', 'Shelf life must be at least 1 month') }),
    uom_id: z.number().min(1, { message: msg('validation.uomRequired', 'Unit of measure is required') }),
    tracking: z.enum(['lot', 'serial', 'none']),
    relative_density_20c: z.string().optional(),
    refractive_index_20c: z.string().optional(),
    optical_rotation_20c: z.string().optional(),
    flash_point_c: z.number().optional(),
    ethanol_solubility: z.string().optional(),
    key_compounds: z.string().optional(),
    max_moisture_pct: z.number().optional(),
    min_yield_pct: z.number().optional(),
    description: z.string().optional()
  })
}

export const materialFormSchema = getMaterialFormSchema()
export type MaterialFormValues = z.infer<typeof materialFormSchema>
