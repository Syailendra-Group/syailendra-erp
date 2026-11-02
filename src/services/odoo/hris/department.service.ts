/**
 * department.service.ts — Odoo 18 RPC Service for HR Departments
 * Syailendra Group ERP
 */

import { odoo } from '@/lib/odoo'

import type { OdooFieldValue } from '@/lib/odoo/types'
import type { DepartmentFormValues } from '@/schemas/hris/department-schema'
import type { DepartmentRecord } from '@/types/hris/department'

export async function fetchDepartments(): Promise<DepartmentRecord[]> {
  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>('hr.department', [], ['id', 'name', 'active'], { order: 'name asc' })

  return records.map((r) => ({
    id: r.id as number,
    name: (r.name as string) || 'Department',
    active: Boolean(r.active)
  }))
}

export async function persistDepartment(values: DepartmentFormValues): Promise<void> {
  const { id, name, active } = values
  const payload: Record<string, OdooFieldValue> = { name, active }

  if (id) {
    await odoo.client.write('hr.department', [id], payload)
  } else {
    await odoo.client.create('hr.department', payload)
  }
}

export async function updateDepartmentActiveState(id: number, active: boolean): Promise<boolean> {
  return odoo.client.write('hr.department', [id], { active })
}
