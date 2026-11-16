/**
 * commodity.ts — TypeScript definitions for Commodity Master (syailendra.crop)
 * Syailendra Group ERP (SCM Pillar)
 */

export type PlantPart = 'leaves' | 'rhizome' | 'wood' | 'bark' | 'seeds' | 'flowers' | 'fruit' | 'roots'

export type CultivationStatus = 'cultivated' | 'wild'

export interface CommodityRecord {
  id: number
  name: string
  latinName: string
  code: string
  plantPart: PlantPart
  cultivationStatus: CultivationStatus
  lifespanMonths: number | null
  harvestSeason: string
  harvestFrequency: string
  description: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CommodityOption {
  id: number
  name: string
  code: string
  latinName: string
}

export interface FetchCommoditiesParams {
  page?: number
  perPage?: number
  search?: string
  plantParts?: string[]
  cultivationStatus?: string[]
  active?: boolean
  order?: string
}

export interface PaginatedCommoditiesResult {
  items: CommodityRecord[]
  total: number
  page: number
  perPage: number
  totalPages: number
}
