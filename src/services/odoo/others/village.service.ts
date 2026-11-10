/**
 * village.service.ts — Odoo 18 RPC Service for Administrative Villages
 * Syailendra Group ERP
 */

import { odoo } from '@/lib/odoo'

import type { OdooDomain, OdooFieldValue } from '@/lib/odoo/types'
import type { VillageFormValues } from '@/schemas/others/village-schema'
import type { VillageRecord } from '@/types/others/village'

export interface FetchVillagesParams {
  page?: number
  perPage?: number
  search?: string
  status?: string | string[]
  districtId?: number | string | string[]
  cityId?: number | string | string[]
  stateId?: number | string | string[]
  countryId?: number | string | string[]
  scope?: string | string[]
  order?: string
}

export interface PaginatedVillagesResult {
  records: VillageRecord[]
  totalCount: number
  page: number
  perPage: number
  pageCount: number
}

function mapVillage(r: Record<string, OdooFieldValue>): VillageRecord {
  return {
    id: r.id as number,
    name: r.name as string,
    code: (r.code as string) || false,
    alias: (r.alias as string) || false,
    description: (r.description as string) || false,
    district_id: r.district_id as [number, string],
    city_id: (r.city_id as [number, string]) || undefined,
    state_id: (r.state_id as [number, string]) || undefined,
    country_id: (r.country_id as [number, string]) || undefined,
    zip_code: (r.zip_code as string) || false,
    latitude: Number(r.latitude) || 0,
    longitude: Number(r.longitude) || 0,
    active: Boolean(r.active)
  }
}

const VILLAGE_READ_FIELDS = ['id', 'name', 'code', 'alias', 'description', 'zip_code', 'city_id', 'district_id', 'latitude', 'longitude', 'active']

export async function fetchVillages(districtId?: number): Promise<VillageRecord[]> {
  const domain: OdooDomain = districtId ? [['district_id', '=', districtId]] : []
  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country.subdistrict', domain, VILLAGE_READ_FIELDS, {
    order: 'name asc',
    limit: 1000
  })
  return records.map(mapVillage)
}

export async function fetchVillagesPaginated(params: FetchVillagesParams = {}): Promise<PaginatedVillagesResult> {
  const { page = 1, perPage = 20, search = '', districtId, cityId, stateId, countryId, scope, order = 'name asc' } = params

  const domain: OdooDomain = []

  if (scope) {
    const scopeArr = Array.isArray(scope) ? scope : [scope]
    if (scopeArr.includes('domestic') && !scopeArr.includes('foreign')) {
      domain.push(['city_id.country_id', '=', 100])
    } else if (scopeArr.includes('foreign') && !scopeArr.includes('domestic')) {
      domain.push(['city_id.country_id', '!=', 100])
    }
  }

  if (countryId) {
    const cids = (Array.isArray(countryId) ? countryId : [countryId]).map(Number).filter((id) => !isNaN(id) && id > 0)
    if (cids.length === 1 && cids[0]) domain.push(['city_id.country_id', '=', cids[0]])
    else if (cids.length > 1) domain.push(['city_id.country_id', 'in', cids])
  }

  if (stateId) {
    const sids = (Array.isArray(stateId) ? stateId : [stateId]).map(Number).filter((id) => !isNaN(id) && id > 0)
    if (sids.length === 1 && sids[0]) domain.push(['city_id.state_id', '=', sids[0]])
    else if (sids.length > 1) domain.push(['city_id.state_id', 'in', sids])
  }

  if (cityId) {
    const cids = (Array.isArray(cityId) ? cityId : [cityId]).map(Number).filter((id) => !isNaN(id) && id > 0)
    if (cids.length === 1 && cids[0]) domain.push(['city_id', '=', cids[0]])
    else if (cids.length > 1) domain.push(['city_id', 'in', cids])
  }

  if (districtId) {
    const dids = (Array.isArray(districtId) ? districtId : [districtId]).map(Number).filter((id) => !isNaN(id) && id > 0)
    if (dids.length === 1 && dids[0]) domain.push(['district_id', '=', dids[0]])
    else if (dids.length > 1) domain.push(['district_id', 'in', dids])
  }

  if (search.trim()) {
    const term = `%${search.trim()}%`
    domain.push('|', ['name', 'ilike', term], ['code', 'ilike', term])
  }

  const offset = Math.max(0, (page - 1) * perPage)

  const [totalCount, rawRecords] = await Promise.all([
    odoo.client.searchCount('res.country.subdistrict', domain),
    odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country.subdistrict', domain, VILLAGE_READ_FIELDS, {
      offset,
      limit: perPage,
      order
    })
  ])

  return {
    records: rawRecords.map(mapVillage),
    totalCount,
    page,
    perPage,
    pageCount: Math.ceil(totalCount / perPage) || 1
  }
}

export async function fetchVillageById(id: number): Promise<VillageRecord | null> {
  const domain: OdooDomain = [['id', '=', id]]
  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country.subdistrict', domain, VILLAGE_READ_FIELDS)
  const r = records[0]
  if (!r) return null
  return mapVillage(r)
}

export async function checkVillageExistsInOdoo(params: {
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
    'res.country.subdistrict',
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

export async function checkParentDistrictExists(name: string, code?: string): Promise<{ exists: boolean; id?: number; name?: string }> {
  const domain: OdooDomain = code ? ['|', ['name', 'ilike', name], ['code', '=', code]] : [['name', 'ilike', name]]
  const records = await odoo.client.searchRead<{ id: number; name: string }>('res.country.district', domain, ['id', 'name'], { limit: 1 })
  if (records.length > 0 && records[0]) {
    return { exists: true, id: records[0].id, name: records[0].name }
  }
  return { exists: false }
}

export async function fetchVillageFilterOptions(): Promise<{
  countries: { id: number; name: string }[]
  states: { id: number; name: string; countryId?: number }[]
  cities: { id: number; name: string; stateId?: number }[]
  districts: { id: number; name: string; cityId?: number }[]
}> {
  const districtsData = await odoo.client.searchRead<Record<string, OdooFieldValue>>(
    'res.country.district',
    [],
    ['country_id', 'state_id', 'city_id', 'name'],
    { limit: 10000, order: 'name asc' }
  )

  const countryMap = new Map<number, string>()
  const stateMap = new Map<number, { id: number; name: string; countryId?: number }>()
  const cityMap = new Map<number, { id: number; name: string; stateId?: number }>()
  const distMap = new Map<number, { id: number; name: string; cityId?: number }>()

  districtsData.forEach((d) => {
    const cId = d.country_id && Array.isArray(d.country_id) ? (d.country_id[0] as number) : undefined
    const cName = d.country_id && Array.isArray(d.country_id) ? (d.country_id[1] as string) : undefined
    const sId = d.state_id && Array.isArray(d.state_id) ? (d.state_id[0] as number) : undefined
    const sName = d.state_id && Array.isArray(d.state_id) ? (d.state_id[1] as string) : undefined
    const cityIdVal = d.city_id && Array.isArray(d.city_id) ? (d.city_id[0] as number) : undefined
    const cityNameVal = d.city_id && Array.isArray(d.city_id) ? (d.city_id[1] as string) : undefined

    if (cId && cName) countryMap.set(cId, cName)
    if (sId && sName) stateMap.set(sId, { id: sId, name: sName, countryId: cId })
    if (cityIdVal && cityNameVal) cityMap.set(cityIdVal, { id: cityIdVal, name: cityNameVal, stateId: sId })
    distMap.set(d.id as number, { id: d.id as number, name: d.name as string, cityId: cityIdVal })
  })

  return {
    countries: Array.from(countryMap.entries()).map(([id, name]) => ({ id, name })),
    states: Array.from(stateMap.values()),
    cities: Array.from(cityMap.values()),
    districts: Array.from(distMap.values())
  }
}

export async function persistVillage(values: VillageFormValues): Promise<number> {
  let finalDistrictId = values.district_id

  if (!finalDistrictId && values.auto_add_district && values.district_name_raw) {
    let finalCityId = values.city_id
    if (!finalCityId && values.regency_code_raw) {
      finalCityId = await odoo.client.create('res.country.city', {
        name: values.regency_code_raw,
        country_id: values.country_id || 100,
        active: true
      })
    }

    finalDistrictId = await odoo.client.create('res.country.district', {
      name: values.district_name_raw,
      code: values.district_code_raw || false,
      city_id: finalCityId || false,
      active: true
    })
  }

  if (!finalDistrictId) {
    throw new Error('District parent record is required before creating a village')
  }

  const payload: Record<string, OdooFieldValue> = {
    name: values.name,
    code: values.code || false,
    alias: values.alias || false,
    description: values.description || false,
    district_id: finalDistrictId,
    zip_code: values.zip_code || false,
    latitude: values.latitude || 0,
    longitude: values.longitude || 0,
    active: true
  }

  if (values.id) {
    await odoo.client.write('res.country.subdistrict', [values.id], payload)
    return values.id
  }

  return await odoo.client.create('res.country.subdistrict', payload)
}

export async function toggleVillageStatus(id: number, active: boolean): Promise<boolean> {
  return odoo.client.write('res.country.subdistrict', [id], { active })
}

export async function deleteVillage(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    await odoo.client.unlink('res.country.subdistrict', [id])
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
