/**
 * commodity.service.ts — Odoo 18 RPC service for Commodity Master (syailendra.crop)
 * Syailendra Group ERP (SCM Pillar)
 */

import { odooClient } from '@/lib/odoo/client'

import type { OdooDomain, OdooFieldValue } from '@/lib/odoo/types'
import type { CommodityFormValues } from '@/schemas/scm/commodity-schema'
import type {
  CommodityOption,
  CommodityRecord,
  CultivationStatus,
  FetchCommoditiesParams,
  PaginatedCommoditiesResult,
  PlantPart
} from '@/types/scm/commodity'

interface RawCommodity {
  id: number
  name: string
  latin_name: string | false
  code: string | false
  plant_part: string
  cultivation_status: string
  lifespan_months: number | false
  harvest_season: string | false
  harvest_frequency: string | false
  description: string | false
  active: boolean
  create_date?: string
  write_date?: string
}

const MODEL = 'syailendra.crop'

const COMMODITY_FIELDS = [
  'id',
  'name',
  'latin_name',
  'code',
  'plant_part',
  'cultivation_status',
  'lifespan_months',
  'harvest_season',
  'harvest_frequency',
  'description',
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

function mapCommodity(raw: RawCommodity): CommodityRecord {
  return {
    id: raw.id,
    name: raw.name,
    latinName: toText(raw.latin_name),
    code: toText(raw.code),
    plantPart: raw.plant_part as PlantPart,
    cultivationStatus: raw.cultivation_status as CultivationStatus,
    lifespanMonths: toNumber(raw.lifespan_months),
    harvestSeason: toText(raw.harvest_season),
    harvestFrequency: toText(raw.harvest_frequency),
    description: toText(raw.description),
    active: Boolean(raw.active),
    createdAt: raw.create_date,
    updatedAt: raw.write_date
  }
}

function normalizeWriteError(error: Error): never {
  const message = error.message

  if (/duplicate key|unique constraint|already exists|harus unik|sudah ada/i.test(message)) {
    throw new Error('DUPLICATE_CODE')
  }

  if (/referenced|foreign key|still referenced|restrict/i.test(message)) {
    throw new Error('RELATIONAL_INTEGRITY_ERROR')
  }

  throw error
}

export class CommodityService {
  static async getCommodities(params: FetchCommoditiesParams = {}, allowedCompanyIds?: number[]): Promise<PaginatedCommoditiesResult> {
    const page = Math.max(1, params.page ?? 1)
    const perPage = Math.max(1, Math.min(100, params.perPage ?? 20))
    const offset = (page - 1) * perPage
    const domain: OdooDomain = []

    const search = params.search?.trim()
    if (search) {
      domain.push('|', '|', ['name', 'ilike', search], ['latin_name', 'ilike', search], ['code', 'ilike', search])
    }
    if (params.plantParts?.length) {
      domain.push(['plant_part', 'in', params.plantParts])
    }
    if (params.cultivationStatus?.length) {
      domain.push(['cultivation_status', 'in', params.cultivationStatus])
    }
    if (typeof params.active === 'boolean') {
      domain.push(['active', '=', params.active])
    }

    const { length, records } = await odooClient.webSearchRead<RawCommodity>(MODEL, domain, [...COMMODITY_FIELDS], {
      offset,
      limit: perPage,
      order: params.order || 'name asc',
      allowedCompanyIds
    })

    return {
      items: records.map(mapCommodity),
      total: length,
      page,
      perPage,
      totalPages: Math.ceil(length / perPage) || 1
    }
  }

  static async getCommodityById(id: number, allowedCompanyIds?: number[]): Promise<CommodityRecord | null> {
    const rows = await odooClient.searchRead<RawCommodity>(MODEL, [['id', '=', id]], [...COMMODITY_FIELDS], {
      limit: 1,
      allowedCompanyIds,
      context: { active_test: false }
    })
    return rows.length > 0 ? mapCommodity(rows[0]) : null
  }

  static async getCommodityOptions(allowedCompanyIds?: number[]): Promise<CommodityOption[]> {
    const rows = await odooClient.searchRead<RawCommodity>(MODEL, [['active', '=', true]], ['id', 'name', 'code', 'latin_name'], {
      order: 'name asc',
      limit: 200,
      allowedCompanyIds,
      context: { active_test: false }
    })

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      code: toText(row.code),
      latinName: toText(row.latin_name)
    }))
  }

  static async createCommodity(data: CommodityFormValues, allowedCompanyIds?: number[]): Promise<number> {
    try {
      return await odooClient.create(
        MODEL,
        {
          name: data.name.trim(),
          latin_name: data.latin_name.trim(),
          code: data.code.trim().toUpperCase(),
          plant_part: data.plant_part,
          cultivation_status: data.cultivation_status,
          lifespan_months: data.lifespan_months ?? 0,
          harvest_season: data.harvest_season?.trim() || false,
          harvest_frequency: data.harvest_frequency?.trim() || false,
          description: data.description?.trim() || false,
          active: data.active
        },
        allowedCompanyIds
      )
    } catch (error) {
      normalizeWriteError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  static async updateCommodity(id: number, data: CommodityFormValues, allowedCompanyIds?: number[]): Promise<boolean> {
    try {
      return await odooClient.write(
        MODEL,
        [id],
        {
          name: data.name.trim(),
          latin_name: data.latin_name.trim(),
          code: data.code.trim().toUpperCase(),
          plant_part: data.plant_part,
          cultivation_status: data.cultivation_status,
          lifespan_months: data.lifespan_months ?? 0,
          harvest_season: data.harvest_season?.trim() || false,
          harvest_frequency: data.harvest_frequency?.trim() || false,
          description: data.description?.trim() || false,
          active: data.active
        },
        allowedCompanyIds
      )
    } catch (error) {
      normalizeWriteError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  static async deleteCommodity(id: number, allowedCompanyIds?: number[]): Promise<boolean> {
    try {
      return await odooClient.unlink(MODEL, [id], allowedCompanyIds)
    } catch (error) {
      normalizeWriteError(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
