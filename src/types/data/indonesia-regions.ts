/**
 * indonesia-regions.ts — Strict TypeScript Types for Administrative Regional Catalog
 * Syailendra Group ERP
 */

export interface CatalogProvince {
  code: string
  name: string
}

export interface CatalogRegency {
  code: string
  regencyCode: string
  provinceCode: string
  provinceName: string
  name: string
  alias: string
}

export interface CatalogDistrict {
  code: string
  districtCode: string
  regencyCode: string
  provinceCode: string
  name: string
  alias: string
}

export interface CatalogVillage {
  code: string
  villageCode: string
  districtCode: string
  name: string
  alias: string
}

export interface CatalogApiResponse<T> {
  success: boolean
  data: T
  error?: string
}
