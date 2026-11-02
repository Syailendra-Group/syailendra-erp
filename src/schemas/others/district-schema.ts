import { z } from 'zod'

export const districtFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, { message: 'District name is required' }),
  code: z.string().optional(),
  city_id: z.number().optional(),
  regency_name_raw: z.string().optional(),
  state_id_raw: z.number().optional(),
  auto_add_regency: z.boolean(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
})

export type DistrictFormValues = z.infer<typeof districtFormSchema>
