/**
 * material.ts — Type definitions for Product Master & Commodity Catalog
 * Syailendra Group ERP — SCM Pillar
 */

export type ProductCategory = 'essential_oils' | 'natural_isolates' | 'carrier_oils' | 'hydrosols' | 'raw_biomass' | 'packaging'

export type AromaNote = 'top' | 'middle' | 'base' | 'fixative'

export type ExtractionMethod =
  'steam_distillation' | 'hydro_distillation' | 'cold_pressed' | 'solvent_extraction' | 'fractional_distillation' | 'none'

export interface ProductQcSpecs {
  relative_density_20c?: string
  refractive_index_20c?: string
  optical_rotation_20c?: string
  flash_point_c?: number
  ethanol_solubility?: string
  key_compounds?: string
  max_moisture_pct?: number
  min_yield_pct?: number
}

export interface ProductRecord {
  id: number
  default_code: string
  name: string
  commercial_name?: string
  category: ProductCategory
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
  imageUrl: string | null
  qc_specs?: ProductQcSpecs
  available_sizes?: string[]
  description?: string
  image_1920?: string | null
  profileImageUrl?: string | null
}

export interface FetchProductsParams {
  page?: number
  perPage?: number
  search?: string
  category?: string | string[]
  tracking?: string | string[]
  active?: boolean
  order?: string
}

export interface PaginatedProductsResult {
  records: ProductRecord[]
  totalCount: number
  page: number
  perPage: number
  pageCount: number
}
