'use server'

import { revalidatePath } from 'next/cache'

import { employeeFormSchema } from '@/schemas/hris/employee-schema'
import { fetchDepartmentOptions, fetchEmployees, persistEmployee, updateEmployeeActiveState } from '@/services/odoo/hris/employee.service'

import type { EmployeeFormValues } from '@/schemas/hris/employee-schema'
import type { DepartmentOption, EmployeeRecord } from '@/types/hris/employee'

export type { DepartmentOption, EmployeeRecord }

export async function getEmployeesAction(): Promise<{
  employees: EmployeeRecord[]
  departments: DepartmentOption[]
}> {
  try {
    const [employees, departments] = await Promise.all([fetchEmployees(), fetchDepartmentOptions()])
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

  try {
    await persistEmployee(parsed.data)
    revalidatePath('/admin/employees')
    return { success: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to save employee'
    return { success: false, error: msg }
  }
}

export async function toggleEmployeeStatusAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await updateEmployeeActiveState(id, active)
    revalidatePath('/admin/employees')
    return { success: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to toggle status'
    return { success: false, error: msg }
  }
}
