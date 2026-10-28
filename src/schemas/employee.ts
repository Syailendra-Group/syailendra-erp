import { z } from 'zod'

export const employeeFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  work_email: z.string().email('Invalid email address').or(z.literal('')),
  work_phone: z.string().min(6, 'Phone number is too short').or(z.literal('')),
  job_title: z.string().min(2, 'Job title is required'),
  department_id: z.number().min(1, 'Please select a department')
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>
