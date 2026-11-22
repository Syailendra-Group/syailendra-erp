/**
 * harvest.ts — TypeScript interface definitions for Field Harvest Sessions (stock.lot)
 * Syailendra Group ERP (SCM Pillar)
 * Complies with octadev-coding-rules-v84 (Rule 2, 6, 100)
 */

export type HarvestStatus = 'received' | 'ready' | 'distilled' | 'cancelled'

export type HarvestQualityGrading = 'grade_a' | 'grade_b' | 'grade_c'

export interface HarvestRecord {
  id: number
  name: string
  ref: string
  productId: number
  productName: string
  productCode: string
  partnerId: number
  partnerName: string
  partnerCode?: string
  harvestDate: string
  netWeightKg: number
  moisturePercent?: number
  expectedYieldPercent?: number
  plantationLocation?: string
  gpsLatitude?: number
  gpsLongitude?: number
  status: HarvestStatus
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface HarvestFormValues {
  name: string
  ref: string
  productId: number
  partnerId: number
  harvestDate: string
  netWeightKg: number
  moisturePercent?: number | null
  expectedYieldPercent?: number | null
  plantationLocation?: string
  gpsLatitude?: number | null
  gpsLongitude?: number | null
  status: HarvestStatus
  notes?: string
}

export interface HarvestListResponse {
  items: HarvestRecord[]
  total: number
  page: number
  perPage: number
  totalPages: number
}
