'use server'

import { revalidatePath } from 'next/cache'

import { departmentFormSchema } from '@/schemas/sbi/hrm/department-schema'
import {
  fetchDepartments,
  fetchDepartmentsPaginated,
  persistDepartment,
  updateDepartmentActiveState
} from '@/services/odoo/sbi/hrm/department.service'

import type { DepartmentFormValues } from '@/schemas/sbi/hrm/department-schema'
import type { FetchDepartmentsPaginatedParams, FetchDepartmentsPaginatedResult } from '@/services/odoo/sbi/hrm/department.service'
import type { DepartmentRecord } from '@/types/sbi/hrm/department'

export type { DepartmentRecord }

export async function getDepartmentsAction(): Promise<{ departments: DepartmentRecord[]; error?: string }> {
  try {
    const departments = await fetchDepartments()
    return { departments }
  } catch {
    return { departments: [], error: 'Failed to retrieve departments from Odoo 18' }
  }
}

export async function getDepartmentsPaginatedAction(params: FetchDepartmentsPaginatedParams = {}): Promise<FetchDepartmentsPaginatedResult> {
  try {
    return await fetchDepartmentsPaginated(params)
  } catch {
    return { records: [], totalCount: 0, page: params.page || 1, perPage: params.perPage || 20 }
  }
}

export async function saveDepartmentAction(rawValues: DepartmentFormValues): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = departmentFormSchema.parse(rawValues)
    await persistDepartment(validated)
    revalidatePath('/admin/departments')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to persist department record in Odoo' }
  }
}

export async function toggleDepartmentStatusAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDepartmentActiveState(id, active)
    revalidatePath('/admin/departments')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to toggle department status in Odoo' }
  }
}
