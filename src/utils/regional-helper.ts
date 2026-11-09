/**
 * regional-helper.ts — Reusable helper utilities for regional selection and cascading
 * Syailendra Group ERP
 */

import type { DistrictRecord } from '@/types/others/district'
import type { ProvinceRecord } from '@/types/others/province'
import type { RegencyRecord } from '@/types/others/regency'

export interface SelectOption {
  label: string
  value: string
}

export interface ForeignPlaceholderParams {
  poolLength: number
  parentId?: number
  emptyWithParent: string
  emptyWithoutParent: string
  defaultPlaceholder: string
}

/**
 * Filter foreign provinces excluding Indonesia (ID 100) and optionally matching selected country
 */
export function filterForeignProvinces(provinces: ProvinceRecord[], selectedCountryId?: number): SelectOption[] {
  const foreignPool = provinces.filter((p) => p.country_id && p.country_id[0] !== 100)
  const scopedPool =
    !selectedCountryId || selectedCountryId === 100 ? foreignPool : foreignPool.filter((p) => p.country_id && p.country_id[0] === selectedCountryId)

  return scopedPool.map((p) => ({
    label: `${p.name}${p.country_id ? ` (${p.country_id[1]})` : ''}`,
    value: String(p.id)
  }))
}

/**
 * Filter foreign regencies matching selected province / state ID
 */
export function filterForeignRegencies(regencies: RegencyRecord[], selectedStateId?: number): SelectOption[] {
  const foreignPool = regencies.filter((r) => r.country_id && r.country_id[0] !== 100)
  const scopedPool = !selectedStateId ? foreignPool : foreignPool.filter((r) => r.state_id && r.state_id[0] === selectedStateId)

  return scopedPool.map((r) => ({
    label: `${r.name}${r.country_id ? ` (${r.country_id[1]})` : ''}`,
    value: String(r.id)
  }))
}

/**
 * Filter foreign districts matching selected regency / city ID
 */
export function filterForeignDistricts(districts: DistrictRecord[], selectedCityId?: number): SelectOption[] {
  const foreignPool = districts.filter((d) => d.country_id && d.country_id[0] !== 100)
  const scopedPool = !selectedCityId ? foreignPool : foreignPool.filter((d) => d.city_id && d.city_id[0] === selectedCityId)

  return scopedPool.map((d) => ({
    label: `${d.name}${d.city_id ? ` (${d.city_id[1]})` : ''}`,
    value: String(d.id)
  }))
}

/**
 * Resolve localized placeholder without nested ternary conditions
 */
export function getForeignSelectPlaceholder({
  poolLength,
  parentId,
  emptyWithParent,
  emptyWithoutParent,
  defaultPlaceholder
}: ForeignPlaceholderParams): string {
  if (poolLength > 0) {
    return defaultPlaceholder
  }
  return parentId ? emptyWithParent : emptyWithoutParent
}

/**
 * Extract GPS coordinates safely from a regional record
 */
export function extractCentroidCoordinates(
  record?: { latitude?: number; longitude?: number } | null
): { latitude: number; longitude: number } | null {
  if (record && typeof record.latitude === 'number' && typeof record.longitude === 'number' && (record.latitude !== 0 || record.longitude !== 0)) {
    return {
      latitude: record.latitude,
      longitude: record.longitude
    }
  }
  return null
}
