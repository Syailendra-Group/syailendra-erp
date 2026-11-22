import { z } from 'zod'

const optionalNumber = (schema = z.number()) =>
  z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : Number(val)), schema)

// Required by W7 KIND_REQUIRED_FIELDS for kind 'distillation':
// [harvest_id, product_id, distillation_date, biomass_input_kg]
export const distillerDistillationSchema = z.object({
  partnerId: z.string().min(1, { message: 'errors.required' }),
  farmId: z.string().min(1, { message: 'errors.required' }),
  harvestId: z.string().min(1, { message: 'errors.required' }),
  productId: z.string().min(1, { message: 'errors.required' }),
  distillationDate: z.string().min(1, { message: 'errors.required' }),
  biomassInputKg: z.coerce.number().positive({ message: 'errors.positive' }),
  durationHours: optionalNumber(z.number().nonnegative()).optional(),
  peakTempC: optionalNumber().optional(),
  steamPressureBar: optionalNumber().optional(),
  operatorName: z.string().trim().optional().default(''),
  method: z.enum(['water', 'steam']).optional(),
  steamWaterTempC: optionalNumber().optional(),
  cyclesCount: optionalNumber(z.number().int().nonnegative()).optional(),
  steamSource: z.string().optional().default(''),
  biomassCondition: z.string().optional().default(''),
  crudeOilOutputKg: optionalNumber(z.number().nonnegative()).optional(),
  hydrosolOutputLiter: optionalNumber(z.number().nonnegative()).optional(),
  yieldPercent: optionalNumber(z.number().nonnegative()).optional(),
  oilVolumeLiter: optionalNumber(z.number().nonnegative()).optional(),
  filteredOilKg: optionalNumber(z.number().nonnegative()).optional(),
  packedOilKg: optionalNumber(z.number().nonnegative()).optional(),
  packingVarianceKg: optionalNumber().optional(),
  productionNotes: z.string().trim().optional().default(''),
  lat: optionalNumber().optional(),
  lon: optionalNumber().optional()
})

export type DistillerDistillationInput = z.infer<typeof distillerDistillationSchema>

export const DISTILLATION_REQUIRED_FIELDS = [
  'harvestId',
  'productId',
  'distillationDate',
  'biomassInputKg'
] as const satisfies (keyof DistillerDistillationInput)[]
