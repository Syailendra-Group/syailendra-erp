/**
 * employee.service.ts — Odoo 18 RPC Service for HR Employees
 * Syailendra Group ERP
 */

import { odoo } from '@/lib/odoo'

import type { EmployeeFormValues } from '@/schemas/hris/employee-schema'
import type { DepartmentOption, EmployeeRecord } from '@/types/hris/employee'

export async function fetchEmployees(): Promise<EmployeeRecord[]> {
  return odoo.client.searchRead<EmployeeRecord>('hr.employee', [], ['id', 'name', 'work_email', 'work_phone', 'job_title', 'department_id', 'active'])
}

export async function fetchDepartmentOptions(): Promise<DepartmentOption[]> {
  return odoo.client.searchRead<DepartmentOption>('hr.department', [], ['id', 'name'])
}

export async function persistEmployee(values: EmployeeFormValues): Promise<void> {
  const { id, name, work_email, work_phone, job_title, department_id } = values

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
}

export async function updateEmployeeActiveState(id: number, active: boolean): Promise<boolean> {
  return odoo.client.write('hr.employee', [id], { active })
}
