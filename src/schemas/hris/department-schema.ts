/**
 * department-schema.ts — Zod validation schema for HRIS Departments
 * Syailendra Group ERP
 */

import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils'

import type { SchemaTranslator } from '@/utils'

export function getDepartmentFormSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    id: z.number().optional(),
    name: z.string().min(2, { message: msg('validation.nameRequired', 'Department name must be at least 2 characters', { min: 2 }) }),
    active: z.boolean()
  })
}

export const departmentFormSchema = getDepartmentFormSchema()
export type DepartmentFormValues = z.infer<typeof departmentFormSchema>
