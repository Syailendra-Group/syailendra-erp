/**
 * distillery.ts — TypeScript definitions for Distillation Facility Master (syailendra.distillery)
 * Syailendra Group ERP (SCM Pillar)
 */

export const DISTILLATION_METHODS = ['steam', 'water_dist', 'water_steam', 'hydrodiffusion', 'co2', 'cold_press', 'solvent', 'enfleurage'] as const

export const BOILER_MATERIALS = ['stainless_316', 'stainless_304', 'copper', 'mild_steel', 'galvanized'] as const

export const FUEL_TYPES = ['firewood', 'biomass', 'lpg', 'solar', 'electric'] as const

export type DistillationMethod = (typeof DISTILLATION_METHODS)[number]
export type BoilerMaterial = (typeof BOILER_MATERIALS)[number]
export type FuelType = (typeof FUEL_TYPES)[number]

export interface DistilleryRecord {
  id: number
  name: string
  code: string
  partnerId: number | null
  partnerName: string | null
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
  facilityAreaM2: number | null
  distillationMethod: DistillationMethod
  boilerCount: number
  boilerCapacityKg: number | null
  boilerMaterial: BoilerMaterial
  fuelType: FuelType
  avgDurationHours: number | null
  operatingTempC: number | null
  operatingPressureBar: number | null
  avgYieldPercent: number | null
  monthlyCapacityKg: number | null
  yearlyCapacityKg: number | null
  maxCapacityKg: number | null
  leadTimeDays: number | null
  moqKg: number | null
  photoDistillery: string | null
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface DistilleryPartnerOption {
  id: number
  name: string
  ref: string
}

export interface FetchDistilleriesParams {
  page?: number
  perPage?: number
  search?: string
  methods?: string[]
  active?: boolean
  order?: string
}

export interface FetchDistilleriesPaginatedResult {
  records: DistilleryRecord[]
  totalCount: number
  page: number
  perPage: number
}
