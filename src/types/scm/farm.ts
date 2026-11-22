/**
 * farm.ts — TypeScript definitions for Farm / Terroir Master (syailendra.farm)
 * Syailendra Group ERP (SCM Pillar)
 */

import type { CommodityOption } from './commodity'

export type FarmingSystem = 'organic' | 'semi_organic' | 'conventional' | 'agroforestry'

export interface FarmRecord {
  id: number
  name: string
  code: string
  partnerId: number | null
  partnerName: string | null
  cropIds: number[]
  countryId: number | null
  stateId: number | null
  stateName: string | null
  cityId: number | null
  cityName: string | null
  districtId: number | null
  districtName: string | null
  subdistrictId: number | null
  subdistrictName: string | null
  addressDetail: string
  latitude: number | null
  longitude: number | null
  elevationMdpl: number | null
  areaHa: number | null
  googleMapsUrl: string
  farmingSystem: FarmingSystem
  usesPesticide: boolean
  pesticideTypes: string
  usesHerbicide: boolean
  herbicideTypes: string
  fertilizerTypes: string
  waterSource: string
  landHistory: string
  photoFarm: string | null
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface FarmPartnerOption {
  id: number
  name: string
  ref: string
  /** Jenis Supplier label, shown so the operator can tell a farmer from a cooperative. */
  typeName?: string
}

export interface FetchFarmsParams {
  page?: number
  perPage?: number
  search?: string
  farmingSystems?: string[]
  active?: boolean
  order?: string
}

export interface PaginatedFarmsResult {
  items: FarmRecord[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface FarmsTableData {
  page: PaginatedFarmsResult
  commodityOptions: CommodityOption[]
}
