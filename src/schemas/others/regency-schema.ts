import { z } from 'zod'

export const regencyFormSchema = z.object({
  id: z.number().optional(),
  is_domestic: z.boolean(),
  name: z.string().min(2, { message: 'Regency/City name is required' }),
  code: z.string().optional(),
  alias: z.string().optional(),
  description: z.string().optional(),
  country_id: z.number().min(1, { message: 'Country is required' }),
  state_id: z.number().optional(),
  province_name_raw: z.string().optional(),
  province_code_raw: z.string().optional(),
  auto_add_province: z.boolean(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
})

export type RegencyFormValues = z.infer<typeof regencyFormSchema>
