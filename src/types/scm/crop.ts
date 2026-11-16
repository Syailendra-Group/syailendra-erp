/**
 * crop.ts — TypeScript definitions for Crop / Commodity Master (syailendra.crop)
 * Syailendra Group ERP (SCM Pillar)
 */

export type PlantPart = 'leaves' | 'rhizome' | 'wood' | 'bark' | 'seeds' | 'flowers' | 'fruit' | 'roots'

export type CultivationStatus = 'cultivated' | 'wild'

export interface CropRecord {
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

export interface CropOption {
  id: number
  name: string
  code: string
  latinName: string
}

export interface FetchCropsParams {
  page?: number
  perPage?: number
  search?: string
  plantParts?: string[]
  cultivationStatus?: string[]
  active?: boolean
  order?: string
}

export interface PaginatedCropsResult {
  items: CropRecord[]
  total: number
  page: number
  perPage: number
  totalPages: number
}
