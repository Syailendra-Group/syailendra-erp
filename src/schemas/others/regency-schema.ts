import { z } from 'zod'

export const regencyFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, { message: 'Name is required' }),
  code: z.string().optional(),
  alias: z.string().min(1, { message: 'Alias name is required' }),
  description: z.string().optional(),
  is_domestic: z.boolean(),
  country_id: z.number().optional(),
  state_id: z.number().optional(),
  province_name_raw: z.string().optional(),
  province_code_raw: z.string().optional(),
  auto_add_province: z.boolean(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
})

export type RegencyFormValues = z.infer<typeof regencyFormSchema>
