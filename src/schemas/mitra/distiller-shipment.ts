import { z } from 'zod'

type ErrorMessages = Record<string, Record<string, string>>

const optionalNumber = () => z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : Number(val)), z.number())

// Required by W7 KIND_REQUIRED_FIELDS for kind 'shipment': [distillation_id, shipment_date]
export const distillerShipmentSchema = z.object({
  distillationId: z.string().min(1, { message: 'errors.required' }),
  shipmentDate: z.string().min(1, { message: 'errors.required' }),
  weightKg: z.coerce.number().positive({ message: 'errors.positive' }),
  notes: z.string().trim().optional().default(''),
  lat: optionalNumber().optional(),
  lon: optionalNumber().optional()
})

export type DistillerShipmentInput = z.infer<typeof distillerShipmentSchema>

export const SHIPMENT_REQUIRED_FIELDS = ['distillationId', 'shipmentDate'] as const satisfies (keyof DistillerShipmentInput)[]

export function shipmentErrorMessages(t: (key: string) => string): ErrorMessages {
  const messages: ErrorMessages = {}
  for (const field of ['distillationId', 'shipmentDate', 'weightKg']) {
    messages[field] = { too_small: t('errors.required') }
  }
  messages['weightKg'] = {
    ...messages['weightKg'],
    too_small: t('errors.positive')
  }
  return messages
}
