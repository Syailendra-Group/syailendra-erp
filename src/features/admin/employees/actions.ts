'use server'

import { revalidatePath } from 'next/cache'

import { odoo } from '@/lib/odoo'
import { employeeFormSchema } from '@/schemas/employee'

import type { EmployeeFormValues } from '@/schemas/employee'

export interface EmployeeRecord {
  id: number
  name: string
  work_email: string
  work_phone: string
  job_title: string
  department_id: [number, string] | false
  active: boolean
}

export interface DepartmentOption {
  id: number
  name: string
}

export async function getEmployeesAction(): Promise<{
  employees: EmployeeRecord[]
  departments: DepartmentOption[]
}> {
  try {
    const employees = await odoo.client.searchRead<EmployeeRecord>(
      'hr.employee',
      [],
      ['id', 'name', 'work_email', 'work_phone', 'job_title', 'department_id', 'active']
    )

    const departments = await odoo.client.searchRead<DepartmentOption>('hr.department', [], ['id', 'name'])

    return { employees, departments }
  } catch (error) {
    console.error('Failed to fetch employees:', error)
    return { employees: [], departments: [] }
  }
}

export async function saveEmployeeAction(values: EmployeeFormValues): Promise<{ success: boolean; error?: string }> {
  const parsed = employeeFormSchema.safeParse(values)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message }
  }

  const { id, name, work_email, work_phone, job_title, department_id } = parsed.data

  try {
    const payload = {
      name,
      work_email: work_email || false,
      work_phone: work_phone || false,
      job_title,
      department_id
    }

    if (id) {
      await odoo.client.write('hr.employee', [id], payload)
    } else {
      await odoo.client.create('hr.employee', payload)
    }

    revalidatePath('/admin/employees')
    return { success: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to save employee'
    return { success: false, error: msg }
  }
}

export async function toggleEmployeeStatusAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await odoo.client.write('hr.employee', [id], { active })
    revalidatePath('/admin/employees')
    return { success: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to toggle status'
    return { success: false, error: msg }
  }
}
