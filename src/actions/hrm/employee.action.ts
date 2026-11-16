'use server'

import { revalidatePath } from 'next/cache'

import { requireSession } from '@/lib/auth/guard'
import { employeeFormSchema } from '@/schemas/hrm/employee-schema'
import {
  fetchDepartmentOptions,
  fetchEmployees,
  fetchEmployeesPaginated,
  persistEmployee,
  updateEmployeeActiveState
} from '@/services/odoo/hrm/employee.service'

import type { EmployeeFormValues } from '@/schemas/hrm/employee-schema'
import type { FetchEmployeesPaginatedParams, FetchEmployeesPaginatedResult } from '@/services/odoo/hrm/employee.service'
import type { DepartmentOption, EmployeeRecord } from '@/types/hrm/employee'

export type { DepartmentOption, EmployeeRecord }

export async function getEmployeesAction(): Promise<{ employees: EmployeeRecord[]; error?: string }> {
  await requireSession()
  try {
    const employees = await fetchEmployees()
    return { employees }
  } catch {
    return { employees: [], error: 'Failed to retrieve employees from Odoo 18' }
  }
}

export async function getEmployeesPaginatedAction(params: FetchEmployeesPaginatedParams = {}): Promise<FetchEmployeesPaginatedResult> {
  await requireSession()
  try {
    return await fetchEmployeesPaginated(params)
  } catch {
    return { records: [], totalCount: 0, page: params.page || 1, perPage: params.perPage || 20 }
  }
}

export async function getDepartmentOptionsAction(): Promise<DepartmentOption[]> {
  await requireSession()
  try {
    return await fetchDepartmentOptions()
  } catch {
    return []
  }
}

export async function saveEmployeeAction(rawValues: EmployeeFormValues): Promise<{ success: boolean; error?: string }> {
  await requireSession()
  try {
    const validated = employeeFormSchema.parse(rawValues)
    await persistEmployee(validated)
    revalidatePath('/admin/employees')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to persist employee record in Odoo' }
  }
}

export async function toggleEmployeeStatusAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  await requireSession()
  try {
    await updateEmployeeActiveState(id, active)
    revalidatePath('/admin/employees')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to toggle employee status in Odoo' }
  }
}
