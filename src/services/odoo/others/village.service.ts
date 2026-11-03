/**
 * village.service.ts — Odoo 18 RPC Service for Villages (Kelurahan/Desa)
 * Syailendra Group ERP
 */

import { odoo } from '@/lib/odoo'
import { buildStatusDomain } from '@/utils'

import type { OdooDomain, OdooFieldValue } from '@/lib/odoo/types'
import type { VillageFormValues } from '@/schemas/others/village-schema'
import type { VillageRecord } from '@/types/others/village'

export interface FetchVillagesParams {
  page?: number
  perPage?: number
  search?: string
  status?: string | string[]
  districtId?: number
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
    district_id: r.district_id as [number, string],
    city_id: (r.city_id as [number, string]) || undefined,
    zip_code: (r.zip_code as string) || false,
    latitude: Number(r.latitude) || 0,
    longitude: Number(r.longitude) || 0,
    active: Boolean(r.active)
  }
}

const VILLAGE_READ_FIELDS = ['id', 'name', 'code', 'zip_code', 'city_id', 'district_id', 'latitude', 'longitude', 'active']

export async function fetchVillages(districtId?: number): Promise<VillageRecord[]> {
  const domain: OdooDomain = districtId ? [['district_id', '=', districtId]] : []
  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.country.subdistrict', domain, VILLAGE_READ_FIELDS, {
    order: 'name asc',
    limit: 600
  })
  return records.map(mapVillage)
}

export async function fetchVillagesPaginated(params: FetchVillagesParams = {}): Promise<PaginatedVillagesResult> {
  const { page = 1, perPage = 20, search = '', status, districtId, order = 'name asc' } = params

  const domain: OdooDomain = []

  if (districtId) {
    domain.push(['district_id', '=', districtId])
  }

  const statusTuples = buildStatusDomain(status)
  statusTuples.forEach((t) => domain.push(t))

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

export async function persistVillage(values: VillageFormValues): Promise<number> {
  let finalDistrictId = values.district_id

  if (!finalDistrictId && values.auto_add_district && values.district_name_raw) {
    finalDistrictId = await odoo.client.create('res.country.district', {
      name: values.district_name_raw,
      city_id: values.city_id_raw || false,
      country_id: 100
    })
  }

  if (!finalDistrictId) {
    throw new Error('District parent record is required before creating a village')
  }

  const payload: Record<string, OdooFieldValue> = {
    name: values.name,
    code: values.code || false,
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
