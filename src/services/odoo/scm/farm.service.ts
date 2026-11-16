/**
 * farm.service.ts — Odoo 18 RPC service for Farm / Terroir Master (syailendra.farm)
 * Syailendra Group ERP (SCM Pillar)
 */

import { odooClient } from '@/lib/odoo/client'

import type { OdooDomain, OdooFieldValue } from '@/lib/odoo/types'
import type { FarmFormValues } from '@/schemas/scm/farm-schema'
import type { FarmingSystem, FarmPartnerOption, FarmRecord, FetchFarmsParams, PaginatedFarmsResult } from '@/types/scm/farm'

interface RawFarm {
  id: number
  name: string
  code: string | false
  partner_id: [number, string] | false
  crop_ids: number[]
  country_id: [number, string] | false
  state_id: [number, string] | false
  city_id: [number, string] | false
  district_id: [number, string] | false
  subdistrict_id: [number, string] | false
  address_detail: string | false
  latitude: number | false
  longitude: number | false
  elevation_mdpl: number | false
  area_ha: number | false
  google_maps_url: string | false
  farming_system: string
  uses_pesticide: boolean
  pesticide_types: string | false
  uses_herbicide: boolean
  herbicide_types: string | false
  fertilizer_types: string | false
  water_source: string | false
  land_history: string | false
  photo_farm?: string | false
  active: boolean
  create_date?: string
  write_date?: string
}

const MODEL = 'syailendra.farm'

const FARM_FIELDS = [
  'id',
  'name',
  'code',
  'partner_id',
  'crop_ids',
  'country_id',
  'state_id',
  'city_id',
  'district_id',
  'subdistrict_id',
  'address_detail',
  'latitude',
  'longitude',
  'elevation_mdpl',
  'area_ha',
  'google_maps_url',
  'farming_system',
  'uses_pesticide',
  'pesticide_types',
  'uses_herbicide',
  'herbicide_types',
  'fertilizer_types',
  'water_source',
  'land_history',
  'active',
  'create_date',
  'write_date'
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

function mapFarm(raw: RawFarm): FarmRecord {
  const partner = toRelation(raw.partner_id)
  const state = toRelation(raw.state_id)
  const city = toRelation(raw.city_id)
  const district = toRelation(raw.district_id)
  const subdistrict = toRelation(raw.subdistrict_id)
  const country = toRelation(raw.country_id)

  return {
    id: raw.id,
    name: raw.name,
    code: toText(raw.code),
    partnerId: partner ? partner[0] : null,
    partnerName: partner ? partner[1] : null,
    cropIds: Array.isArray(raw.crop_ids) ? raw.crop_ids : [],
    countryId: country ? country[0] : null,
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
    elevationMdpl: toNumber(raw.elevation_mdpl),
    areaHa: toNumber(raw.area_ha),
    googleMapsUrl: toText(raw.google_maps_url),
    farmingSystem: raw.farming_system as FarmingSystem,
    usesPesticide: Boolean(raw.uses_pesticide),
    pesticideTypes: toText(raw.pesticide_types),
    usesHerbicide: Boolean(raw.uses_herbicide),
    herbicideTypes: toText(raw.herbicide_types),
    fertilizerTypes: toText(raw.fertilizer_types),
    waterSource: toText(raw.water_source),
    landHistory: toText(raw.land_history),
    photoFarm: typeof raw.photo_farm === 'string' ? raw.photo_farm : null,
    active: Boolean(raw.active),
    createdAt: raw.create_date,
    updatedAt: raw.write_date
  }
}

function normalizeWriteError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error)

  if (/duplicate key|unique constraint|already exists|harus unik|sudah ada/i.test(message)) {
    throw new Error('DUPLICATE_CODE')
  }

  if (/referenced|foreign key|still referenced|restrict/i.test(message)) {
    throw new Error('RELATIONAL_INTEGRITY_ERROR')
  }

  throw error instanceof Error ? error : new Error(message)
}

function stripBase64Prefix(value: string): string {
  return value.replace(/^data:[^;]+;base64,/, '')
}

export class FarmService {
  static async getFarms(params: FetchFarmsParams = {}, allowedCompanyIds?: number[]): Promise<PaginatedFarmsResult> {
    const page = Math.max(1, params.page ?? 1)
    const perPage = Math.max(1, Math.min(100, params.perPage ?? 20))
    const offset = (page - 1) * perPage
    const domain: OdooDomain = []

    const search = params.search?.trim()
    if (search) {
      domain.push('|', '|', ['name', 'ilike', search], ['code', 'ilike', search], ['partner_id', 'ilike', search])
    }
    if (params.farmingSystems?.length) {
      domain.push(['farming_system', 'in', params.farmingSystems])
    }
    if (typeof params.active === 'boolean') {
      domain.push(['active', '=', params.active])
    }

    const [total, rows] = await Promise.all([
      odooClient.searchCount(MODEL, domain, allowedCompanyIds),
      odooClient.searchRead<RawFarm>(MODEL, domain, [...FARM_FIELDS], {
        offset,
        limit: perPage,
        order: params.order || 'name asc',
        allowedCompanyIds
      })
    ])

    return {
      items: rows.map(mapFarm),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage) || 1
    }
  }

  static async getFarmById(id: number, allowedCompanyIds?: number[]): Promise<FarmRecord | null> {
    const rows = await odooClient.searchRead<RawFarm>(MODEL, [['id', '=', id]], [...FARM_FIELDS, 'photo_farm'], {
      limit: 1,
      allowedCompanyIds
    })
    return rows.length > 0 ? mapFarm(rows[0]) : null
  }

  static async getPartnerOptions(allowedCompanyIds?: number[]): Promise<FarmPartnerOption[]> {
    const rows = await odooClient.searchRead<{ id: number; name: string; ref: string | false }>(
      'res.partner',
      ['|', ['supplier_rank', '>', 0], ['ref', 'like', 'FMR%']],
      ['id', 'name', 'ref'],
      { order: 'name asc', limit: 300, allowedCompanyIds }
    )

    return rows.map((row) => ({ id: row.id, name: row.name, ref: toText(row.ref) }))
  }

  static async createFarm(data: FarmFormValues, allowedCompanyIds?: number[]): Promise<number> {
    try {
      return await odooClient.create(MODEL, this.buildValues(data), allowedCompanyIds)
    } catch (error) {
      normalizeWriteError(error)
    }
  }

  static async updateFarm(id: number, data: FarmFormValues, allowedCompanyIds?: number[]): Promise<boolean> {
    try {
      return await odooClient.write(MODEL, [id], this.buildValues(data), allowedCompanyIds)
    } catch (error) {
      normalizeWriteError(error)
    }
  }

  static async deleteFarm(id: number, allowedCompanyIds?: number[]): Promise<boolean> {
    try {
      return await odooClient.unlink(MODEL, [id], allowedCompanyIds)
    } catch (error) {
      normalizeWriteError(error)
    }
  }

  private static buildValues(data: FarmFormValues): Record<string, OdooFieldValue> {
    return {
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      partner_id: data.partner_id,
      crop_ids: [[6, 0, data.crop_ids]],
      country_id: data.country_id ?? false,
      state_id: data.state_id ?? false,
      city_id: data.city_id ?? false,
      district_id: data.district_id ?? false,
      subdistrict_id: data.subdistrict_id ?? false,
      address_detail: data.address_detail?.trim() || false,
      latitude: data.latitude ?? 0,
      longitude: data.longitude ?? 0,
      elevation_mdpl: data.elevation_mdpl ?? 0,
      area_ha: data.area_ha ?? 0,
      farming_system: data.farming_system,
      uses_pesticide: data.uses_pesticide,
      pesticide_types: data.pesticide_types?.trim() || false,
      uses_herbicide: data.uses_herbicide,
      herbicide_types: data.herbicide_types?.trim() || false,
      fertilizer_types: data.fertilizer_types?.trim() || false,
      water_source: data.water_source?.trim() || false,
      land_history: data.land_history?.trim() || false,
      photo_farm: data.photo_farm ? stripBase64Prefix(data.photo_farm) : false,
      active: data.active
    }
  }
}
