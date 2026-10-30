import { z } from 'zod'

export const distillerFormSchema = z.object({
  id: z.number().optional(),
  ref: z
    .string()
    .min(3, { message: 'Distiller ID must be at least 3 characters' })
    .regex(/^DST-[A-Z0-9]+-[0-9]+$/, { message: 'Format must follow DST-[WILAYAH]-[NO_URUT] (e.g. DST-JTG-002)' }),
  name: z.string().min(3, { message: 'Unit / facility name must be at least 3 characters' }),
  boiler_capacity_kg: z.number().positive({ message: 'Capacity must be positive' }),
  method: z.string().min(1, { message: 'Distillation method is required' }),
  boiler_material: z.string(),
  ownership: z.string(),
  operator_name: z.string().min(2, { message: 'Operator name is required' }),
  phone: z.string().optional(),
  city: z.string().min(2, { message: 'City / regency is required' }),
  street: z.string().min(2, { message: 'Facility address is required' }),
  partner_latitude: z.number().optional(),
  partner_longitude: z.number().optional(),
  sanitation_status: z.string(),
  comment: z.string().optional()
})

export type DistillerFormValues = z.infer<typeof distillerFormSchema>
