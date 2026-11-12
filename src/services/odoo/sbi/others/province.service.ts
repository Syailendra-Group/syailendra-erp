/**
 * province.service.ts — Odoo 18 RPC Service for Provinces/States
 * Syailendra Group ERP
 */

import { odoo } from '@/lib/odoo'

import type { OdooDomain, OdooFieldValue } from '@/lib/odoo/types'
import type { ProvinceFormValues } from '@/schemas/sbi/others/province-schema'
import type { ProvinceRecord } from '@/types/sbi/others/province'

export interface FetchProvincesParams {
  page?: number
  perPage?: number
  search?: string
  countryId?: number | string | string[]
  scope?: string | string[]
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
    prefix: (r.prefix as string) || false,
    alias: (r.alias as string) || false,
    description: (r.description as string) || false,
    country_id: r.country_id as [number, string],
    latitude: typeof r.latitude === 'number' ? r.latitude : false,
    longitude: typeof r.longitude === 'number' ? r.longitude : false
  }
}

const PROVINCE_READ_FIELDS = ['id', 'name', 'code', 'prefix', 'alias', 'description', 'country_id', 'latitude', 'longitude']

export async function fetchProvinces(countryId?: number): Promise<ProvinceRecord[]> {
  const domain: OdooDomain = countryId ? [['country_id', '=', countryId]] : []
  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country.state', domain, PROVINCE_READ_FIELDS, {
    order: countryId ? 'name asc' : 'id desc, name asc',
    limit: 2500
  })
  return records.map(mapStateToProvince)
}

export async function fetchProvincesPaginated(params: FetchProvincesParams = {}): Promise<PaginatedProvincesResult> {
  const { page = 1, perPage = 20, search = '', countryId, scope, order = 'name asc' } = params

  const domain: OdooDomain = []

  if (scope) {
    const scopeArr = Array.isArray(scope) ? scope : [scope]
    if (scopeArr.includes('domestic') && !scopeArr.includes('foreign')) {
      domain.push(['country_id', '=', 100])
    } else if (scopeArr.includes('foreign') && !scopeArr.includes('domestic')) {
      domain.push(['country_id', '!=', 100])
    }
  }

  if (countryId) {
    const cids = (Array.isArray(countryId) ? countryId : [countryId]).map(Number).filter((id) => !isNaN(id) && id > 0)
    if (cids.length === 1 && cids[0]) domain.push(['country_id', '=', cids[0]])
    else if (cids.length > 1) domain.push(['country_id', 'in', cids])
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

export async function checkProvinceExistsInOdoo(params: { code?: string; name?: string }): Promise<{ exists: boolean; id?: number; name?: string }> {
  const { code, name } = params
  if (!code && !name) return { exists: false }

  const domain: OdooDomain = []
  if (code && name) {
    domain.push('|', ['code', '=', code], ['name', 'ilike', name])
  } else if (code) {
    domain.push(['code', '=', code])
  } else if (name) {
    domain.push(['name', 'ilike', name])
  }

  const records = await odoo.client.searchRead<{ id: number; name: string }>('res.country.state', domain, ['id', 'name'], { limit: 1 })
  if (records.length > 0 && records[0]) {
    return { exists: true, id: records[0].id, name: records[0].name }
  }
  return { exists: false }
}

export async function fetchProvinceFilterOptions(): Promise<{ countries: { id: number; name: string }[] }> {
  const states = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country.state', [], ['country_id'], { limit: 2500 })
  const countryMap = new Map<number, string>()

  states.forEach((s) => {
    if (s.country_id && Array.isArray(s.country_id)) {
      countryMap.set(s.country_id[0] as number, s.country_id[1] as string)
    }
  })

  return {
    countries: Array.from(countryMap.entries()).map(([id, name]) => ({ id, name }))
  }
}

export async function persistProvince(values: ProvinceFormValues): Promise<number> {
  const payload: Record<string, OdooFieldValue> = {
    name: values.name,
    code: values.code || false,
    prefix: values.prefix || false,
    alias: values.alias || false,
    description: values.description || false,
    country_id: values.country_id || 100,
    latitude: values.latitude || false,
    longitude: values.longitude || false
  }

  if (values.id) {
    await odoo.client.write('res.country.state', [values.id], payload)
    return values.id
  }

  return await odoo.client.create('res.country.state', payload)
}

export async function deleteProvince(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    await odoo.client.unlink('res.country.state', [id])
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('foreign key') || msg.includes('still referenced') || msg.includes('restrict') || msg.includes('linked')) {
      return {
        success: false,
        error: 'Wilayah ini tidak dapat dihapus karena sedang digunakan oleh data relasi lain di sistem.'
      }
    }
    return { success: false, error: msg || 'Gagal menghapus data wilayah.' }
  }
}
