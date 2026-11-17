/**
 * distillery.service.ts — Odoo 18 RPC service for Distillation Facility Master (syailendra.distillery)
 * Syailendra Group ERP (SCM Pillar)
 */

import { odooClient } from '@/lib/odoo/client'

import type { OdooDomain, OdooFieldValue } from '@/lib/odoo/types'
import type { DistilleryFormValues } from '@/schemas/scm/distillery-schema'
import type {
  BoilerMaterial,
  DistillationMethod,
  DistilleryPartnerOption,
  DistilleryRecord,
  FetchDistilleriesPaginatedResult,
  FetchDistilleriesParams,
  FuelType
} from '@/types/scm/distillery'

interface RawDistillery {
  id: number
  name: string
  code: string | false
  partner_id: [number, string] | false
  state_id: [number, string] | false
  city_id: [number, string] | false
  district_id: [number, string] | false
  subdistrict_id: [number, string] | false
  address_detail: string | false
  latitude: number | false
  longitude: number | false
  facility_area_m2: number | false
  distillation_method: string
  boiler_count: number
  boiler_capacity_kg: number | false
  boiler_material: string
  fuel_type: string
  avg_duration_hours: number | false
  operating_temp_c: number | false
  operating_pressure_bar: number | false
  avg_yield_percent: number | false
  monthly_capacity_kg: number | false
  yearly_capacity_kg: number | false
  max_capacity_kg: number | false
  lead_time_days: number | false
  moq_kg: number | false
  photo_distillery?: string | false
  active: boolean
  create_date?: string
  write_date?: string
}

const MODEL = 'syailendra.distillery'

const DISTILLERY_FIELDS = [
  'id',
  'name',
  'code',
  'partner_id',
  'state_id',
  'city_id',
  'district_id',
  'subdistrict_id',
  'address_detail',
  'latitude',
  'longitude',
  'facility_area_m2',
  'distillation_method',
  'boiler_count',
  'boiler_capacity_kg',
  'boiler_material',
  'fuel_type',
  'avg_duration_hours',
  'operating_temp_c',
  'operating_pressure_bar',
  'avg_yield_percent',
  'monthly_capacity_kg',
  'yearly_capacity_kg',
  'max_capacity_kg',
  'lead_time_days',
  'moq_kg',
  'active'
] as const

function toText(value: OdooFieldValue | undefined): string {
  return typeof value === 'string' ? value : ''
}

function toNumber(value: OdooFieldValue | undefined): number | null {
  return typeof value === 'number' ? value : null
}

function toRelation(value: OdooFieldValue | undefined): [number, string] | null {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === 'number' ? (value as [number, string]) : null
}

function stripBase64Prefix(value: string): string {
  return value.replace(/^data:[^;]+;base64,/, '')
}

function mapDistillery(raw: RawDistillery): DistilleryRecord {
  const partner = toRelation(raw.partner_id)
  const state = toRelation(raw.state_id)
  const city = toRelation(raw.city_id)
  const district = toRelation(raw.district_id)
  const subdistrict = toRelation(raw.subdistrict_id)

  return {
    id: raw.id,
    name: raw.name,
    code: toText(raw.code),
    partnerId: partner ? partner[0] : null,
    partnerName: partner ? partner[1] : null,
    stateId: state ? state[0] : null,
    stateName: state ? state[1] : null,
    cityId: city ? city[0] : null,
    cityName: city ? city[1] : null,
    districtId: district ? district[0] : null,
    districtName: district ? district[1] : null,
    subdistrictId: subdistrict ? subdistrict[0] : null,
    subdistrictName: subdistrict ? subdistrict[1] : null,
    addressDetail: toText(raw.address_detail),
    latitude: toNumber(raw.latitude),
    longitude: toNumber(raw.longitude),
    facilityAreaM2: toNumber(raw.facility_area_m2),
    distillationMethod: raw.distillation_method as DistillationMethod,
    boilerCount: typeof raw.boiler_count === 'number' ? raw.boiler_count : 1,
    boilerCapacityKg: toNumber(raw.boiler_capacity_kg),
    boilerMaterial: raw.boiler_material as BoilerMaterial,
    fuelType: raw.fuel_type as FuelType,
    avgDurationHours: toNumber(raw.avg_duration_hours),
    operatingTempC: toNumber(raw.operating_temp_c),
    operatingPressureBar: toNumber(raw.operating_pressure_bar),
    avgYieldPercent: toNumber(raw.avg_yield_percent),
    monthlyCapacityKg: toNumber(raw.monthly_capacity_kg),
    yearlyCapacityKg: toNumber(raw.yearly_capacity_kg),
    maxCapacityKg: toNumber(raw.max_capacity_kg),
    leadTimeDays: toNumber(raw.lead_time_days),
    moqKg: toNumber(raw.moq_kg),
    photoDistillery: typeof raw.photo_distillery === 'string' ? raw.photo_distillery : null,
    active: Boolean(raw.active),
    createdAt: raw.create_date,
    updatedAt: raw.write_date
  }
}

const DUPLICATE_CODE_PATTERN = /duplicate key|unique constraint|already exists|harus unik|sudah ada/i

function buildDomain(params: FetchDistilleriesParams): OdooDomain {
  const domain: OdooDomain = []

  const search = params.search?.trim()
  if (search) {
    domain.push('|', '|', ['name', 'ilike', search], ['code', 'ilike', search], ['partner_id', 'ilike', search])
  }

  if (params.methods?.length) {
    domain.push(['distillation_method', 'in', params.methods])
  }

  if (typeof params.active === 'boolean') {
    domain.push(['active', '=', params.active])
  }

  return domain
}

function buildValues(data: DistilleryFormValues): Record<string, OdooFieldValue> {
  return {
    name: data.name.trim(),
    code: data.code.trim().toUpperCase(),
    partner_id: data.partner_id,
    state_id: data.state_id ?? false,
    city_id: data.city_id ?? false,
    district_id: data.district_id ?? false,
    subdistrict_id: data.subdistrict_id ?? false,
    address_detail: data.address_detail?.trim() || false,
    latitude: data.latitude ?? 0,
    longitude: data.longitude ?? 0,
    facility_area_m2: data.facility_area_m2 ?? 0,
    distillation_method: data.distillation_method,
    boiler_count: data.boiler_count,
    boiler_capacity_kg: data.boiler_capacity_kg,
    boiler_material: data.boiler_material,
    fuel_type: data.fuel_type,
    avg_duration_hours: data.avg_duration_hours ?? 0,
    operating_temp_c: data.operating_temp_c ?? 0,
    operating_pressure_bar: data.operating_pressure_bar ?? 0,
    avg_yield_percent: data.avg_yield_percent ?? 0,
    monthly_capacity_kg: data.monthly_capacity_kg ?? 0,
    yearly_capacity_kg: data.yearly_capacity_kg ?? 0,
    max_capacity_kg: data.max_capacity_kg ?? 0,
    lead_time_days: data.lead_time_days ?? 0,
    moq_kg: data.moq_kg ?? 0,
    photo_distillery: data.photo_distillery ? stripBase64Prefix(data.photo_distillery) : false,
    active: data.active
  }
}

/**
 * Fetch distilleries with server-side windowing, search count, and faceted filters.
 * `context: { active_test: false }` is mandatory (Rule #186) so the active/archived
 * facet can return archived rows.
 */
export async function fetchDistilleriesPaginated(params: FetchDistilleriesParams = {}): Promise<FetchDistilleriesPaginatedResult> {
  const page = Math.max(1, params.page ?? 1)
  const perPage = Math.max(1, Math.min(100, params.perPage ?? 20))
  const offset = (page - 1) * perPage
  const domain = buildDomain(params)

  const [totalCount, rawRecords] = await Promise.all([
    odooClient.searchCount(MODEL, domain, undefined, { context: { active_test: false } }),
    odooClient.searchRead<RawDistillery>(MODEL, domain, [...DISTILLERY_FIELDS], {
      offset,
      limit: perPage,
      order: params.order || 'code asc',
      context: { active_test: false }
    })
  ])

  return {
    records: rawRecords.map(mapDistillery),
    totalCount,
    page,
    perPage
  }
}

export async function fetchDistilleries(params: FetchDistilleriesParams = {}): Promise<DistilleryRecord[]> {
  const res = await fetchDistilleriesPaginated({ ...params, perPage: 100 })
  return res.records
}

export async function fetchDistilleryById(id: number): Promise<DistilleryRecord | null> {
  const rows = await odooClient.searchRead<RawDistillery>(MODEL, [['id', '=', id]], [...DISTILLERY_FIELDS, 'photo_distillery'], {
    limit: 1,
    context: { active_test: false }
  })
  return rows.length > 0 ? mapDistillery(rows[0]) : null
}

export async function fetchDistilleryPartnerOptions(): Promise<DistilleryPartnerOption[]> {
  const rows = await odooClient.searchRead<{ id: number; name: string; ref: string | false }>(
    'res.partner',
    ['|', ['supplier_rank', '>', 0], ['ref', 'like', 'SUP%']],
    ['id', 'name', 'ref'],
    { order: 'name asc', limit: 300, context: { active_test: false } }
  )

  return rows.map((row) => ({ id: row.id, name: row.name, ref: toText(row.ref) }))
}

export async function persistDistillery(values: DistilleryFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const payload = buildValues(values)

    if (values.id) {
      await odooClient.write(MODEL, [values.id], payload)
      return { success: true, id: values.id }
    }

    const newId = await odooClient.create<number>(MODEL, payload)
    return { success: true, id: newId }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to persist distillation facility in Odoo'
    return {
      success: false,
      error: DUPLICATE_CODE_PATTERN.test(message) ? 'DUPLICATE_CODE' : message
    }
  }
}

export async function updateDistilleryActiveState(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await odooClient.write(MODEL, [id], { active })
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update distillation facility status in Odoo'
    }
  }
}
