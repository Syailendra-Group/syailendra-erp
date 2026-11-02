import { z } from 'zod'

export const provinceFormSchema = z.object({
  id: z.number().optional(),
  is_domestic: z.boolean(),
  name: z.string().min(2, { message: 'Province name is required' }),
  code: z.string().min(1, { message: 'Province code is required' }),
  country_id: z.number().min(1, { message: 'Country is required' }),
  alias: z.string().optional(),
  description: z.string().optional()
})

export type ProvinceFormValues = z.infer<typeof provinceFormSchema>
