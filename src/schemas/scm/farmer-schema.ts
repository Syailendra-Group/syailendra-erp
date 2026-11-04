import { z } from 'zod'

export const farmerFormSchema = z.object({
  id: z.number().optional(),
  ref: z
    .string()
    .min(3, { message: 'Farmer ID must be at least 3 characters' })
    .regex(/^FMR-[A-Z0-9]+-[0-9]+$/, {
      message: 'Format must follow FMR-[WILAYAH]-[NO_URUT] (e.g. FMR-JTG-003)'
    }),
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  vat: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  country_id: z.number().optional(),
  state_id: z.number().optional(),
  city_id: z.number().optional(),
  district_id: z.number().optional(),
  subdistrict_id: z.number().optional(),
  zip_code: z.string().optional(),
  address_detail: z.string().optional(),
  address_benchmark: z.string().optional(),
  street: z.string().min(2, { message: 'Village / plantation address is required' }),
  city: z.string().min(2, { message: 'Regency / district is required' }),
  partner_latitude: z.number().min(-90).max(90),
  partner_longitude: z.number().min(-180).max(180),
  commodity: z.string().min(1, { message: 'Main commodity is required' }),
  farming_method: z.string(),
  land_area_m2: z.number().optional(),
  comment: z.string().optional()
})

export type FarmerFormValues = z.infer<typeof farmerFormSchema>
