/**
 * department.service.ts — Odoo 18 RPC Service for HR Departments
 * Syailendra Group ERP
 */

import { odoo } from '@/lib/odoo'
import { buildStatusDomain } from '@/utils'

import type { OdooDomain, OdooDomainTuple } from '@/lib/odoo/types'
import type { DepartmentFormValues } from '@/schemas/hris/department-schema'
import type { DepartmentRecord } from '@/types/hris/department'

const DEPT_FIELDS = ['id', 'name', 'active']

export interface FetchDepartmentsPaginatedParams {
  page?: number
  perPage?: number
  search?: string
  status?: string | string[]
  order?: string
}

export interface FetchDepartmentsPaginatedResult {
  records: DepartmentRecord[]
  totalCount: number
  page: number
  perPage: number
}

export async function fetchDepartments(): Promise<DepartmentRecord[]> {
  return odoo.client.searchRead<DepartmentRecord>('hr.department', [], DEPT_FIELDS, {
    order: 'name asc'
  })
}

export async function fetchDepartmentsPaginated(params: FetchDepartmentsPaginatedParams = {}): Promise<FetchDepartmentsPaginatedResult> {
  const page = Math.max(1, params.page || 1)
  const perPage = Math.max(1, params.perPage || 20)
  const offset = (page - 1) * perPage

  const baseDomain: (OdooDomainTuple | string)[] = []

  const statusTuples = buildStatusDomain(params.status)
  statusTuples.forEach((t) => baseDomain.push(t))

  if (params.search?.trim()) {
    const term = `%${params.search.trim()}%`
    baseDomain.push(['name', 'ilike', term])
  }

  const [totalCount, rawRecords] = await Promise.all([
    odoo.client.searchCount('hr.department', baseDomain as OdooDomain),
    odoo.client.searchRead<DepartmentRecord>('hr.department', baseDomain as OdooDomain, DEPT_FIELDS, {
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

export async function persistDepartment(values: DepartmentFormValues): Promise<void> {
  const { id, name } = values

  if (id) {
    await odoo.client.write('hr.department', [id], { name })
  } else {
    await odoo.client.create('hr.department', { name })
  }
}

export async function updateDepartmentActiveState(id: number, active: boolean): Promise<boolean> {
  return odoo.client.write('hr.department', [id], { active })
}
