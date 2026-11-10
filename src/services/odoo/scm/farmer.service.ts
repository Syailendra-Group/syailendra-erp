/**
 * farmer.service.ts — Odoo 18 RPC Service for Farmers & Plantations
 * Syailendra Group ERP
 */

import { odoo } from '@/lib/odoo'
import { buildPolishOrDomain, buildStatusDomain } from '@/utils'

import type { OdooDomain, OdooFieldValue } from '@/lib/odoo/types'
import type { FarmerFormValues } from '@/schemas/scm/farmer-schema'
import type { FarmerRecord } from '@/types/scm/farmer'

export interface FetchFarmersParams {
  page?: number
  perPage?: number
  search?: string
  commodity?: string | string[]
  status?: string | string[]
  order?: string
}

export interface PaginatedFarmersResult {
  records: FarmerRecord[]
  totalCount: number
  page: number
  perPage: number
  pageCount: number
}

function mapPartnerToFarmer(r: Record<string, OdooFieldValue>): FarmerRecord {
  const comment = (r.comment as string) || ''
  let commodity = 'gaharu'
  if (comment.toLowerCase().includes('nilam')) commodity = 'nilam'
  else if (comment.toLowerCase().includes('serai')) commodity = 'serai'
  else if (comment.toLowerCase().includes('kopi')) commodity = 'kopi'
  else if (comment.toLowerCase().includes('cengkeh')) commodity = 'cengkeh'

  let land_area_m2 = 2500
  const landMatch = comment.match(/Luas Lahan:\s*(\d+)/i)
  if (landMatch && landMatch[1]) {
    land_area_m2 = parseInt(landMatch[1], 10)
  }

  let legacy_code: string | false = false
  const legacyMatch = comment.match(/Accurate:\s*([^\s|]+)/i)
  if (legacyMatch && legacyMatch[1]) {
    legacy_code = legacyMatch[1]
  }

  return {
    id: r.id as number,
    ref: (r.ref as string) || 'FMR-JTG-' + r.id,
    name: (r.name as string) || 'Petani Mitra',
    vat: (r.vat as string) || false,
    street: (r.street as string) || '-',
    city: (r.city as string) || '-',
    partner_latitude: Number(r.partner_latitude) || 0,
    partner_longitude: Number(r.partner_longitude) || 0,
    phone: (r.phone as string) || false,
    email: (r.email as string) || false,
    comment: comment || false,
    commodity,
    farming_method: comment.toLowerCase().includes('organik') ? 'organic' : 'conventional',
    land_area_m2,
    active: Boolean(r.active),
    legacy_code,
    country_id: (r.country_id as [number, string]) || false,
    state_id: (r.state_id as [number, string]) || false,
    city_id: (r.city_id as [number, string]) || false,
    district_id: (r.district_id as [number, string]) || false,
    subdistrict_id: (r.subdistrict_id as [number, string]) || false,
    zip_code: (r.zip as string) || false,
    address_detail: (r.address_detail as string) || false
  }
}

const FARMER_READ_FIELDS = [
  'id',
  'ref',
  'name',
  'vat',
  'street',
  'city',
  'partner_latitude',
  'partner_longitude',
  'phone',
  'email',
  'comment',
  'active',
  'country_id',
  'state_id',
  'city_id',
  'district_id',
  'subdistrict_id',
  'zip',
  'address_detail'
]

export async function fetchFarmers(): Promise<FarmerRecord[]> {
  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.partner', [['ref', 'like', 'FMR%']], FARMER_READ_FIELDS, {
    order: 'ref asc'
  })

  return records.map(mapPartnerToFarmer)
}

export async function fetchFarmersPaginated(params: FetchFarmersParams = {}): Promise<PaginatedFarmersResult> {
  const { page = 1, perPage = 20, search = '', commodity, status, order = 'ref asc' } = params

  const domain: OdooDomain = [['ref', 'like', 'FMR%']]

  const statusTuples = buildStatusDomain(status)
  statusTuples.forEach((t) => domain.push(t))

  const commodityDomain = buildPolishOrDomain('comment', commodity, 'ilike')
  commodityDomain.forEach((d) => domain.push(d))

  if (search.trim()) {
    const term = `%${search.trim()}%`
    domain.push('|', ['name', 'ilike', term], ['ref', 'ilike', term])
  }

  const offset = Math.max(0, (page - 1) * perPage)

  const [totalCount, rawRecords] = await Promise.all([
    odoo.client.searchCount('res.partner', domain),
    odoo.client.searchRead<Record<string, OdooFieldValue>>('res.partner', domain, FARMER_READ_FIELDS, {
      offset,
      limit: perPage,
      order
    })
  ])

  return {
    records: rawRecords.map(mapPartnerToFarmer),
    totalCount,
    page,
    perPage,
    pageCount: Math.ceil(totalCount / perPage) || 1
  }
}

export async function fetchFarmerByIdentifier(identifier: number | string): Promise<FarmerRecord | null> {
  const isNumeric = typeof identifier === 'number' || /^[0-9]+$/.test(String(identifier))
  const domain: OdooDomain = isNumeric ? [['id', '=', Number(identifier)]] : [['ref', '=', String(identifier)]]

  const records = await odoo.client.searchRead<Record<string, OdooFieldValue>>('res.partner', domain, FARMER_READ_FIELDS)

  const r = records[0]
  if (!r) return null

  return mapPartnerToFarmer(r)
}

export async function persistFarmer(values: FarmerFormValues): Promise<number> {
  const {
    id,
    ref,
    name,
    vat,
    street,
    city,
    country_id,
    state_id,
    city_id,
    district_id,
    subdistrict_id,
    zip_code,
    address_detail,
    address_benchmark,
    partner_latitude,
    partner_longitude,
    phone,
    email,
    commodity,
    farming_method,
    land_area_m2,
    comment,
    legacy_code
  } = values

  const combinedNotes = [
    comment ? comment.trim() : '',
    legacy_code ? 'Accurate: ' + legacy_code.trim() : '',
    'Komoditas: ' + commodity.toUpperCase(),
    'Metode: ' + farming_method.toUpperCase(),
    land_area_m2 ? 'Luas Lahan: ' + land_area_m2 + ' m²' : '',
    address_benchmark ? 'Patokan: ' + address_benchmark.trim() : ''
  ]
    .filter(Boolean)
    .join(' | ')

  const payload: Record<string, OdooFieldValue> = {
    ref,
    name,
    vat: vat || false,
    street: street || address_detail || false,
    city: city || false,
    country_id: country_id || 100,
    state_id: state_id || false,
    city_id: city_id || false,
    district_id: district_id || false,
    subdistrict_id: subdistrict_id || false,
    zip: zip_code || false,
    address_detail: address_detail || false,
    partner_latitude,
    partner_longitude,
    phone: phone || false,
    email: email || false,
    comment: combinedNotes,
    autopost_bills: 'ask'
  }

  if (id) {
    await odoo.client.write('res.partner', [id], payload)
    return id
  }

  payload.is_company = false
  payload.active = true
  const createdId = await odoo.client.create('res.partner', payload)
  return createdId
}

export async function updateFarmerActiveState(id: number, active: boolean): Promise<boolean> {
  return odoo.client.write('res.partner', [id], { active })
}
