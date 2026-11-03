/**
 * district.service.ts — Odoo 18 RPC Service for Districts (Kecamatan)
 * Syailendra Group ERP
 */

import { odoo } from '@/lib/odoo'
import { buildStatusDomain } from '@/utils'

import type { OdooDomain, OdooFieldValue } from '@/lib/odoo/types'
import type { DistrictFormValues } from '@/schemas/others/district-schema'
import type { DistrictRecord } from '@/types/others/district'

export interface FetchDistrictsParams {
  page?: number
  perPage?: number
  search?: string
  status?: string | string[]
  cityId?: number
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
    city_id: r.city_id as [number, string],
    state_id: (r.state_id as [number, string]) || undefined,
    country_id: (r.country_id as [number, string]) || undefined,
    latitude: Number(r.latitude) || 0,
    longitude: Number(r.longitude) || 0,
    active: Boolean(r.active)
  }
}

const DISTRICT_READ_FIELDS = ['id', 'name', 'code', 'country_id', 'state_id', 'city_id', 'latitude', 'longitude', 'active']

export async function fetchDistricts(cityId?: number): Promise<DistrictRecord[]> {
  const domain: OdooDomain = cityId ? [['city_id', '=', cityId]] : []
  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country.district', domain, DISTRICT_READ_FIELDS, {
    order: 'name asc',
    limit: 600
  })
  return records.map(mapDistrict)
}

export async function fetchDistrictsPaginated(params: FetchDistrictsParams = {}): Promise<PaginatedDistrictsResult> {
  const { page = 1, perPage = 20, search = '', status, cityId, order = 'name asc' } = params

  const domain: OdooDomain = []

  if (cityId) {
    domain.push(['city_id', '=', cityId])
  }

  const statusTuples = buildStatusDomain(status)
  statusTuples.forEach((t) => domain.push(t))

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

export async function persistDistrict(values: DistrictFormValues): Promise<number> {
  let finalCityId = values.city_id

  if (!finalCityId && values.auto_add_regency && values.regency_name_raw) {
    finalCityId = await odoo.client.create('res.country.city', {
      name: values.regency_name_raw,
      state_id: values.state_id_raw || false,
      country_id: 100
    })
  }

  if (!finalCityId) {
    throw new Error('City/Regency parent record is required before creating a district')
  }

  const payload: Record<string, OdooFieldValue> = {
    name: values.name,
    code: values.code || false,
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
