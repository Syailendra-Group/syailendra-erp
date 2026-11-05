/**
 * material.ts — Type definitions for Material Master & Commodity Catalog
 * Syailendra Group ERP — SCM Pillar
 */

export type MaterialCategory = 'essential_oils' | 'natural_isolates' | 'carrier_oils' | 'hydrosols' | 'raw_biomass' | 'packaging'

export type AromaNote = 'top' | 'middle' | 'base' | 'fixative'

export type ExtractionMethod =
  'steam_distillation' | 'hydro_distillation' | 'cold_pressed' | 'solvent_extraction' | 'fractional_distillation' | 'none'

export interface MaterialQcSpecs {
  relative_density_20c?: string
  refractive_index_20c?: string
  optical_rotation_20c?: string
  flash_point_c?: number
  ethanol_solubility?: string
  key_compounds?: string
  max_moisture_pct?: number
  min_yield_pct?: number
}

export interface MaterialRecord {
  id: number
  default_code: string
  name: string
  commercial_name?: string
  category: MaterialCategory
  botanical_name?: string
  family?: string
  inci_name?: string
  cas_number?: string
  einecs_number?: string
  fema_number?: string
  hs_code: string
  plant_part?: string
  extraction_method: ExtractionMethod
  aroma_note?: AromaNote
  shelf_life_months: number
  uom_id: [number, string]
  tracking: 'lot' | 'serial' | 'none'
  active: boolean
  qc_specs?: MaterialQcSpecs
  available_sizes?: string[]
  description?: string
}

export interface FetchMaterialsParams {
  page?: number
  perPage?: number
  search?: string
  category?: string | string[]
  tracking?: string | string[]
  order?: string
}

export interface PaginatedMaterialsResult {
  records: MaterialRecord[]
  totalCount: number
  page: number
  perPage: number
  pageCount: number
}
