'use server'

import { revalidatePath } from 'next/cache'

import { odoo } from '@/lib/odoo'
import { departmentFormSchema } from '@/schemas/department'

import type { OdooFieldValue } from '@/lib/odoo/types'
import type { DepartmentFormValues } from '@/schemas/department'

export interface DepartmentRecord {
  id: number
  name: string
  active: boolean
}

export async function getDepartmentsAction(): Promise<{ departments: DepartmentRecord[] }> {
  try {
    const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>('hr.department', [], ['id', 'name', 'active'], { order: 'name asc' })

    const departments: DepartmentRecord[] = records.map((r) => {
      let deptName = 'Department'
      if (typeof r.name === 'string') {
        deptName = r.name
      } else if (r.name && typeof r.name === 'object' && !Array.isArray(r.name)) {
        const obj = r.name as Record<string, string>
        deptName = obj.id_ID || obj.en_US || Object.values(obj)[0] || 'Department'
      }

      return {
        id: r.id as number,
        name: deptName,
        active: r.active !== false
      }
    })

    return { departments }
  } catch (err) {
    console.error('Failed to fetch departments from Odoo:', err)
    return { departments: [] }
  }
}

export async function saveDepartmentAction(values: DepartmentFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  const parsed = departmentFormSchema.safeParse(values)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid parameters' }
  }

  const { id, name, active } = parsed.data

  try {
    const payload: Record<string, OdooFieldValue> = {
      name,
      active
    }

    let savedId = id
    if (id) {
      await odoo.client.write('hr.department', [id], payload)
    } else {
      savedId = await odoo.client.create('hr.department', payload)
    }

    revalidatePath('/admin/departments')
    revalidatePath('/admin/employees')
    return { success: true, id: savedId }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save department to Odoo'
    return { success: false, error: msg }
  }
}

export async function toggleDepartmentStatusAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await odoo.client.write('hr.department', [id], { active })
    revalidatePath('/admin/departments')
    revalidatePath('/admin/employees')
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update department status'
    return { success: false, error: msg }
  }
}
