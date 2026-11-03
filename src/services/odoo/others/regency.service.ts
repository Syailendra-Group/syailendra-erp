/**
 * regency.service.ts — Odoo 18 RPC Service for Regencies/Cities
 * Syailendra Group ERP
 */

import { odoo } from '@/lib/odoo'
import { buildStatusDomain } from '@/utils'

import type { OdooDomain, OdooFieldValue } from '@/lib/odoo/types'
import type { RegencyFormValues } from '@/schemas/others/regency-schema'
import type { RegencyRecord } from '@/types/others/regency'

export interface FetchRegenciesParams {
  page?: number
  perPage?: number
  search?: string
  status?: string | string[]
  stateId?: number
  order?: string
}

export interface PaginatedRegenciesResult {
  records: RegencyRecord[]
  totalCount: number
  page: number
  perPage: number
  pageCount: number
}

function mapCityToRegency(r: Record<string, OdooFieldValue>): RegencyRecord {
  return {
    id: r.id as number,
    name: r.name as string,
    code: (r.code as string) || false,
    alias: (r.alias as string) || false,
    description: (r.description as string) || false,
    country_id: r.country_id as [number, string],
    state_id: r.state_id as [number, string],
    latitude: Number(r.latitude) || 0,
    longitude: Number(r.longitude) || 0,
    active: Boolean(r.active)
  }
}

const REGENCY_READ_FIELDS = ['id', 'name', 'code', 'alias', 'description', 'country_id', 'state_id', 'latitude', 'longitude', 'active']

export async function fetchRegencies(stateId?: number): Promise<RegencyRecord[]> {
  const domain: OdooDomain = stateId ? [['state_id', '=', stateId]] : []
  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country.city', domain, REGENCY_READ_FIELDS, {
    order: 'name asc',
    limit: 600
  })
  return records.map(mapCityToRegency)
}

export async function fetchRegenciesPaginated(params: FetchRegenciesParams = {}): Promise<PaginatedRegenciesResult> {
  const { page = 1, perPage = 20, search = '', status, stateId, order = 'name asc' } = params

  const domain: OdooDomain = []

  if (stateId) {
    domain.push(['state_id', '=', stateId])
  }

  // Apply clean status domain via shared helper
  const statusTuples = buildStatusDomain(status)
  statusTuples.forEach((t) => domain.push(t))

  if (search.trim()) {
    const term = `%${search.trim()}%`
    domain.push('|', ['name', 'ilike', term], ['code', 'ilike', term])
  }

  const offset = Math.max(0, (page - 1) * perPage)

  const [totalCount, rawRecords] = await Promise.all([
    odoo.client.searchCount('res.country.city', domain),
    odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country.city', domain, REGENCY_READ_FIELDS, {
      offset,
      limit: perPage,
      order
    })
  ])

  return {
    records: rawRecords.map(mapCityToRegency),
    totalCount,
    page,
    perPage,
    pageCount: Math.ceil(totalCount / perPage) || 1
  }
}

export async function fetchRegencyById(id: number): Promise<RegencyRecord | null> {
  const domain: OdooDomain = [['id', '=', id]]
  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country.city', domain, REGENCY_READ_FIELDS)
  const r = records[0]
  if (!r) return null
  return mapCityToRegency(r)
}

export async function checkProvinceExistsByNameOrCode(name: string, code?: string): Promise<{ exists: boolean; id?: number; name?: string }> {
  const domain: OdooDomain = code ? ['|', ['name', 'ilike', name], ['code', '=', code]] : [['name', 'ilike', name]]
  const records = await odoo.client.searchRead<{ id: number; name: string }>('res.country.state', domain, ['id', 'name'], { limit: 1 })
  if (records.length > 0 && records[0]) {
    return { exists: true, id: records[0].id, name: records[0].name }
  }
  return { exists: false }
}

export async function persistRegency(values: RegencyFormValues): Promise<number> {
  let finalStateId = values.state_id

  if (!finalStateId && values.auto_add_province && values.province_name_raw) {
    finalStateId = await odoo.client.create('res.country.state', {
      name: values.province_name_raw,
      code: values.province_code_raw || values.province_name_raw.substring(0, 3).toUpperCase(),
      country_id: values.country_id || 100
    })
  }

  if (!finalStateId) {
    throw new Error('Province parent record is required before creating a regency/city')
  }

  const payload: Record<string, OdooFieldValue> = {
    name: values.name,
    code: values.code || false,
    alias: values.alias || false,
    description: values.description || false,
    country_id: values.country_id || 100,
    state_id: finalStateId,
    latitude: values.latitude || 0,
    longitude: values.longitude || 0,
    active: true
  }

  if (values.id) {
    await odoo.client.write('res.country.city', [values.id], payload)
    return values.id
  }

  return await odoo.client.create('res.country.city', payload)
}

export async function toggleRegencyStatus(id: number, active: boolean): Promise<boolean> {
  return odoo.client.write('res.country.city', [id], { active })
}
