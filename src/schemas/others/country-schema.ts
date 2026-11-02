import { z } from 'zod'

export const countryFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, { message: 'Country name is required' }),
  code: z.string().length(2, { message: 'ISO Code must be 2 uppercase characters' }),
  phone_code: z.number().optional()
})

export type CountryFormValues = z.infer<typeof countryFormSchema>
