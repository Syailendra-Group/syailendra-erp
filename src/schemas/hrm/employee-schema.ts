/**
 * employee-schema.ts — Zod validation schema for HRIS Employees
 * Syailendra Group ERP
 */

import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils'

import type { SchemaTranslator } from '@/utils'

export function getEmployeeFormSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    id: z.number().optional(),
    name: z.string().min(2, { message: msg('validation.nameRequired', 'Name must be at least 2 characters', { min: 2 }) }),
    work_email: z
      .string()
      .email({ message: msg('validation.emailInvalid', 'Invalid email address') })
      .or(z.literal('')),
    work_phone: z
      .string()
      .min(6, { message: msg('validation.phoneTooShort', 'Phone number is too short', { min: 6 }) })
      .or(z.literal('')),
    job_title: z.string().min(2, { message: msg('validation.jobTitleRequired', 'Job title is required', { min: 2 }) }),
    department_id: z.number().min(1, { message: msg('validation.departmentRequired', 'Please select a department') })
  })
}

export const employeeFormSchema = getEmployeeFormSchema()
export type EmployeeFormValues = z.infer<typeof employeeFormSchema>
