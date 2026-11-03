import { z } from 'zod'

export const villageFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, { message: 'Village name is required' }),
  code: z.string().min(1, { message: 'Code is required' }),
  alias: z.string().min(1, { message: 'Alias name is required' }),
  description: z.string().optional(),
  district_id: z.number().optional(),
  district_name_raw: z.string().optional(),
  city_id_raw: z.number().optional(),
  auto_add_district: z.boolean(),
  zip_code: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
})

export type VillageFormValues = z.infer<typeof villageFormSchema>
