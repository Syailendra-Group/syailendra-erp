'use server'

import { revalidatePath } from 'next/cache'

import { departmentFormSchema } from '@/schemas/hris/department-schema'
import { fetchDepartments, persistDepartment, updateDepartmentActiveState } from '@/services/odoo/hris/department.service'

import type { DepartmentFormValues } from '@/schemas/hris/department-schema'
import type { DepartmentRecord } from '@/types/hris/department'

export type { DepartmentRecord }

export async function getDepartmentsAction(): Promise<{ departments: DepartmentRecord[] }> {
  try {
    const departments = await fetchDepartments()
    return { departments }
  } catch (error) {
    console.error('Failed to fetch departments:', error)
    return { departments: [] }
  }
}

export async function saveDepartmentAction(values: DepartmentFormValues): Promise<{ success: boolean; error?: string }> {
  const parsed = departmentFormSchema.safeParse(values)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message }
  }

  try {
    await persistDepartment(parsed.data)
    revalidatePath('/admin/departments')
    return { success: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to save department'
    return { success: false, error: msg }
  }
}

export async function toggleDepartmentStatusAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDepartmentActiveState(id, active)
    revalidatePath('/admin/departments')
    return { success: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to toggle status'
    return { success: false, error: msg }
  }
}
