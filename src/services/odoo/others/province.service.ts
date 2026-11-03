/**
 * province.service.ts — Odoo 18 RPC Service for Provinces/States
 * Syailendra Group ERP
 */

import { odoo } from '@/lib/odoo'

import type { OdooDomain, OdooFieldValue } from '@/lib/odoo/types'
import type { ProvinceFormValues } from '@/schemas/others/province-schema'
import type { ProvinceRecord } from '@/types/others/province'

export interface FetchProvincesParams {
  page?: number
  perPage?: number
  search?: string
  countryId?: number
  order?: string
}

export interface PaginatedProvincesResult {
  records: ProvinceRecord[]
  totalCount: number
  page: number
  perPage: number
  pageCount: number
}

function mapStateToProvince(r: Record<string, OdooFieldValue>): ProvinceRecord {
  return {
    id: r.id as number,
    name: r.name as string,
    code: (r.code as string) || '',
    country_id: r.country_id as [number, string]
  }
}

const PROVINCE_READ_FIELDS = ['id', 'name', 'code', 'country_id']

export async function fetchProvinces(countryId?: number): Promise<ProvinceRecord[]> {
  const domain: OdooDomain = countryId ? [['country_id', '=', countryId]] : []
  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country.state', domain, PROVINCE_READ_FIELDS, {
    order: 'name asc',
    limit: 200
  })
  return records.map(mapStateToProvince)
}

export async function fetchProvincesPaginated(params: FetchProvincesParams = {}): Promise<PaginatedProvincesResult> {
  const { page = 1, perPage = 20, search = '', countryId, order = 'name asc' } = params

  const domain: OdooDomain = []

  if (countryId) {
    domain.push(['country_id', '=', countryId])
  }

  if (search.trim()) {
    const term = `%${search.trim()}%`
    domain.push('|', ['name', 'ilike', term], ['code', 'ilike', term])
  }

  const offset = Math.max(0, (page - 1) * perPage)

  const [totalCount, rawRecords] = await Promise.all([
    odoo.client.searchCount('res.country.state', domain),
    odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country.state', domain, PROVINCE_READ_FIELDS, {
      offset,
      limit: perPage,
      order
    })
  ])

  return {
    records: rawRecords.map(mapStateToProvince),
    totalCount,
    page,
    perPage,
    pageCount: Math.ceil(totalCount / perPage) || 1
  }
}

export async function fetchProvinceById(id: number): Promise<ProvinceRecord | null> {
  const domain: OdooDomain = [['id', '=', id]]
  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country.state', domain, PROVINCE_READ_FIELDS)
  const r = records[0]
  if (!r) return null
  return mapStateToProvince(r)
}

export async function persistProvince(values: ProvinceFormValues): Promise<number> {
  const payload: Record<string, OdooFieldValue> = {
    name: values.name,
    code: values.code || false,
    country_id: values.country_id || 100
  }

  if (values.id) {
    await odoo.client.write('res.country.state', [values.id], payload)
    return values.id
  }

  return await odoo.client.create('res.country.state', payload)
}
