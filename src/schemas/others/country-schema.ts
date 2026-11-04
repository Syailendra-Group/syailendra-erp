import { z } from 'zod'

export const countryFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, { message: 'Country name is required' }),
  code: z
    .string()
    .min(2, { message: 'Country code must be at least 2 characters' })
    .max(5, { message: 'Country code must be at most 5 characters' })
    .toUpperCase(),
  phone_code: z.number().optional(),
  description: z.string().optional()
})

export type CountryFormValues = z.infer<typeof countryFormSchema>
