import { z } from 'zod'

export const villageFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, { message: 'Village name is required' }),
  code: z.string().optional(),
  alias: z.string().min(1, { message: 'Alias name is required' }),
  description: z.string().optional(),
  is_domestic: z.boolean(),
  country_id: z.number().optional(),
  state_id: z.number().optional(),
  city_id: z.number().optional(),
  district_id: z.number().optional(),
  district_name_raw: z.string().optional(),
  district_code_raw: z.string().optional(),
  regency_code_raw: z.string().optional(),
  province_code_raw: z.string().optional(),
  auto_add_district: z.boolean(),
  zip_code: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
})

export type VillageFormValues = z.infer<typeof villageFormSchema>
