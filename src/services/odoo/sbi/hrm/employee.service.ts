/**
 * employee.service.ts — Odoo 18 RPC Service for HR Employees
 * Syailendra Group ERP
 */

import { odoo } from '@/lib/odoo'
import { buildStatusDomain } from '@/utils'

import type { OdooDomain, OdooDomainTuple, OdooFieldValue } from '@/lib/odoo/types'
import type { EmployeeFormValues } from '@/schemas/sbi/hrm/employee-schema'
import type { DepartmentOption, EmployeeRecord } from '@/types/sbi/hrm/employee'

const EMPLOYEE_FIELDS = ['id', 'name', 'work_email', 'work_phone', 'job_title', 'department_id', 'active']

export interface FetchEmployeesPaginatedParams {
  page?: number
  perPage?: number
  search?: string
  departmentId?: string | string[]
  status?: string | string[]
  order?: string
}

export interface FetchEmployeesPaginatedResult {
  records: EmployeeRecord[]
  totalCount: number
  page: number
  perPage: number
}

export async function fetchEmployees(): Promise<EmployeeRecord[]> {
  return odoo.client.searchRead<EmployeeRecord>('hr.employee', [], EMPLOYEE_FIELDS, {
    order: 'name asc'
  })
}

export async function fetchEmployeesPaginated(params: FetchEmployeesPaginatedParams = {}): Promise<FetchEmployeesPaginatedResult> {
  const page = Math.max(1, params.page || 1)
  const perPage = Math.max(1, params.perPage || 20)
  const offset = (page - 1) * perPage

  const baseDomain: (OdooDomainTuple | string)[] = []

  // Status filter
  const statusTuples = buildStatusDomain(params.status)
  statusTuples.forEach((t) => baseDomain.push(t))

  // Department filter
  if (params.departmentId) {
    const deptArr = Array.isArray(params.departmentId) ? params.departmentId : [params.departmentId]
    const validDepts = deptArr.map((d) => Number(d)).filter((n) => !isNaN(n) && n > 0)
    if (validDepts.length === 1 && validDepts[0]) {
      baseDomain.push(['department_id', '=', validDepts[0]])
    } else if (validDepts.length > 1) {
      baseDomain.push(['department_id', 'in', validDepts])
    }
  }

  // Search keyword domain
  if (params.search?.trim()) {
    const term = `%${params.search.trim()}%`
    baseDomain.push('|', '|', ['name', 'ilike', term], ['work_email', 'ilike', term], ['job_title', 'ilike', term])
  }

  const [totalCount, rawRecords] = await Promise.all([
    odoo.client.searchCount('hr.employee', baseDomain as OdooDomain),
    odoo.client.searchRead<EmployeeRecord>('hr.employee', baseDomain as OdooDomain, EMPLOYEE_FIELDS, {
      offset,
      limit: perPage,
      order: params.order || 'name asc'
    })
  ])

  return {
    records: rawRecords,
    totalCount,
    page,
    perPage
  }
}

export async function fetchDepartmentOptions(): Promise<DepartmentOption[]> {
  return odoo.client.searchRead<DepartmentOption>('hr.department', [], ['id', 'name'], {
    order: 'name asc'
  })
}

export async function persistEmployee(values: EmployeeFormValues): Promise<void> {
  const { id, name, work_email, work_phone, job_title, department_id } = values

  const payload: Record<string, OdooFieldValue> = {
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
