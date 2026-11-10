/**
 * district.service.ts — Odoo 18 RPC Service for Administrative Districts
 * Syailendra Group ERP
 */

import { odoo } from '@/lib/odoo'

import type { OdooDomain, OdooFieldValue } from '@/lib/odoo/types'
import type { DistrictFormValues } from '@/schemas/others/district-schema'
import type { DistrictRecord } from '@/types/others/district'

export interface FetchDistrictsParams {
  page?: number
  perPage?: number
  search?: string
  status?: string | string[]
  cityId?: number | string | string[]
  stateId?: number | string | string[]
  countryId?: number | string | string[]
  scope?: string | string[]
  order?: string
}

export interface PaginatedDistrictsResult {
  records: DistrictRecord[]
  totalCount: number
  page: number
  perPage: number
  pageCount: number
}

function mapDistrict(r: Record<string, OdooFieldValue>): DistrictRecord {
  return {
    id: r.id as number,
    name: r.name as string,
    code: (r.code as string) || false,
    alias: (r.alias as string) || false,
    description: (r.description as string) || false,
    city_id: r.city_id as [number, string],
    state_id: (r.state_id as [number, string]) || undefined,
    country_id: (r.country_id as [number, string]) || undefined,
    latitude: Number(r.latitude) || 0,
    longitude: Number(r.longitude) || 0,
    active: Boolean(r.active)
  }
}

const DISTRICT_READ_FIELDS = ['id', 'name', 'code', 'alias', 'description', 'country_id', 'state_id', 'city_id', 'latitude', 'longitude', 'active']

export async function fetchDistricts(cityId?: number): Promise<DistrictRecord[]> {
  const domain: OdooDomain = cityId ? [['city_id', '=', cityId]] : []
  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country.district', domain, DISTRICT_READ_FIELDS, {
    order: 'name asc',
    limit: 1000
  })
  return records.map(mapDistrict)
}

export async function fetchDistrictsPaginated(params: FetchDistrictsParams = {}): Promise<PaginatedDistrictsResult> {
  const { page = 1, perPage = 20, search = '', cityId, stateId, countryId, scope, order = 'name asc' } = params

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

  if (stateId) {
    const sids = (Array.isArray(stateId) ? stateId : [stateId]).map(Number).filter((id) => !isNaN(id) && id > 0)
    if (sids.length === 1 && sids[0]) domain.push(['state_id', '=', sids[0]])
    else if (sids.length > 1) domain.push(['state_id', 'in', sids])
  }

  if (cityId) {
    const cids = (Array.isArray(cityId) ? cityId : [cityId]).map(Number).filter((id) => !isNaN(id) && id > 0)
    if (cids.length === 1 && cids[0]) domain.push(['city_id', '=', cids[0]])
    else if (cids.length > 1) domain.push(['city_id', 'in', cids])
  }

  if (search.trim()) {
    const term = `%${search.trim()}%`
    domain.push('|', ['name', 'ilike', term], ['code', 'ilike', term])
  }

  const offset = Math.max(0, (page - 1) * perPage)

  const [totalCount, rawRecords] = await Promise.all([
    odoo.client.searchCount('res.country.district', domain),
    odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country.district', domain, DISTRICT_READ_FIELDS, {
      offset,
      limit: perPage,
      order
    })
  ])

  return {
    records: rawRecords.map(mapDistrict),
    totalCount,
    page,
    perPage,
    pageCount: Math.ceil(totalCount / perPage) || 1
  }
}

export async function fetchDistrictById(id: number): Promise<DistrictRecord | null> {
  const domain: OdooDomain = [['id', '=', id]]
  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country.district', domain, DISTRICT_READ_FIELDS)
  const r = records[0]
  if (!r) return null
  return mapDistrict(r)
}

export async function checkDistrictExistsInOdoo(params: {
  code?: string
  name?: string
}): Promise<{ exists: boolean; id?: number; name?: string; code?: string }> {
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

  const records = await odoo.client.searchRead<{ id: number; name: string; code: string | false }>(
    'res.country.district',
    domain,
    ['id', 'name', 'code'],
    { limit: 1 }
  )
  if (records.length > 0 && records[0]) {
    return {
      exists: true,
      id: records[0].id,
      name: records[0].name,
      code: records[0].code || undefined
    }
  }
  return { exists: false }
}

export async function checkParentRegencyExists(name: string, code?: string): Promise<{ exists: boolean; id?: number; name?: string }> {
  const domain: OdooDomain = code ? ['|', ['name', 'ilike', name], ['code', '=', code]] : [['name', 'ilike', name]]
  const records = await odoo.client.searchRead<{ id: number; name: string }>('res.country.city', domain, ['id', 'name'], { limit: 1 })
  if (records.length > 0 && records[0]) {
    return { exists: true, id: records[0].id, name: records[0].name }
  }
  return { exists: false }
}

export async function fetchDistrictFilterOptions(): Promise<{
  countries: { id: number; name: string }[]
  states: { id: number; name: string; countryId?: number }[]
  cities: { id: number; name: string; stateId?: number; countryId?: number }[]
}> {
  const citiesData = await odoo.client.searchRead<Record<string, OdooFieldValue>>(
    'res.country.city',
    [],
    ['country_id', 'state_id', 'name'],
    { limit: 2500, order: 'name asc' }
  )

  const countryMap = new Map<number, string>()
  const stateMap = new Map<number, { id: number; name: string; countryId?: number }>()
  const cityMap = new Map<number, { id: number; name: string; stateId?: number; countryId?: number }>()

  citiesData.forEach((c) => {
    const cId = c.country_id && Array.isArray(c.country_id) ? (c.country_id[0] as number) : undefined
    const cName = c.country_id && Array.isArray(c.country_id) ? (c.country_id[1] as string) : undefined
    const sId = c.state_id && Array.isArray(c.state_id) ? (c.state_id[0] as number) : undefined
    const sName = c.state_id && Array.isArray(c.state_id) ? (c.state_id[1] as string) : undefined

    if (cId && cName) countryMap.set(cId, cName)
    if (sId && sName) stateMap.set(sId, { id: sId, name: sName, countryId: cId })
    cityMap.set(c.id as number, {
      id: c.id as number,
      name: c.name as string,
      stateId: sId,
      countryId: cId
    })
  })

  return {
    countries: Array.from(countryMap.entries()).map(([id, name]) => ({ id, name })),
    states: Array.from(stateMap.values()),
    cities: Array.from(cityMap.values())
  }
}

export async function persistDistrict(values: DistrictFormValues): Promise<number> {
  let finalCityId = values.city_id

  if (!finalCityId && values.auto_add_regency && values.regency_name_raw) {
    let finalStateId = values.state_id
    if (!finalStateId && values.province_name_raw) {
      finalStateId = await odoo.client.create('res.country.state', {
        name: values.province_name_raw,
        code: values.province_code_raw || values.province_name_raw.substring(0, 3).toUpperCase(),
        country_id: values.country_id || 100
      })
    }

    finalCityId = await odoo.client.create('res.country.city', {
      name: values.regency_name_raw,
      code: values.regency_code_raw || false,
      state_id: finalStateId || false,
      country_id: values.country_id || 100,
      active: true
    })
  }

  if (!finalCityId) {
    throw new Error('City/Regency parent record is required before creating a district')
  }

  const payload: Record<string, OdooFieldValue> = {
    name: values.name,
    code: values.code || false,
    alias: values.alias || false,
    description: values.description || false,
    city_id: finalCityId,
    latitude: values.latitude || 0,
    longitude: values.longitude || 0,
    active: true
  }

  if (values.id) {
    await odoo.client.write('res.country.district', [values.id], payload)
    return values.id
  }

  return await odoo.client.create('res.country.district', payload)
}

export async function toggleDistrictStatus(id: number, active: boolean): Promise<boolean> {
  return odoo.client.write('res.country.district', [id], { active })
}

export async function deleteDistrict(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    await odoo.client.unlink('res.country.district', [id])
    return { success: true }
  } catch (err: unknown) {
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
