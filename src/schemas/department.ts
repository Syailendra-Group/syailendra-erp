import { z } from 'zod'

export const departmentFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, { message: 'Department name must be at least 2 characters' }),
  active: z.boolean()
})

export type DepartmentFormValues = z.infer<typeof departmentFormSchema>
