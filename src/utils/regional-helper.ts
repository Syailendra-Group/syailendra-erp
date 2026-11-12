/**
 * regional-helper.ts — Reusable helper utilities for regional selection and cascading
 * Syailendra Group ERP
 */

import type { DistrictRecord } from '@/types/sbi/others/district'
import type { ProvinceRecord } from '@/types/sbi/others/province'
import type { RegencyRecord } from '@/types/sbi/others/regency'

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

export const PROVINCE_PREFIXES: Record<string, string> = {
  aceh: 'ACH',
  'sumatera utara': 'SMU',
  'sumatera barat': 'SMB',
  riau: 'RIU',
  'kepulauan riau': 'KRI',
  jambi: 'JMB',
  'sumatera selatan': 'SMS',
  'bangka belitung': 'BBL',
  'kepulauan bangka belitung': 'BBL',
  bengkulu: 'BKL',
  lampung: 'LMP',
  'dki jakarta': 'JKT',
  'jawa barat': 'JBR',
  banten: 'BTN',
  'jawa tengah': 'JTG',
  'di yogyakarta': 'DIY',
  'jawa timur': 'JTM',
  bali: 'BAL',
  'nusa tenggara barat': 'NTB',
  'nusa tenggara timur': 'NTT',
  'kalimantan barat': 'KLB',
  'kalimantan tengah': 'KLT',
  'kalimantan selatan': 'KLS',
  'kalimantan timur': 'KTI',
  'kalimantan utara': 'KLU',
  'sulawesi utara': 'SLU',
  gorontalo: 'GTO',
  'sulawesi tengah': 'SLT',
  'sulawesi barat': 'SLB',
  'sulawesi selatan': 'SLS',
  'sulawesi tenggara': 'STR',
  maluku: 'MAL',
  'maluku utara': 'MLU',
  papua: 'PAP',
  'papua barat': 'PBR',
  'papua selatan': 'PST',
  'papua tengah': 'PTG',
  'papua pegunungan': 'PPG',
  'papua barat daya': 'PBD'
}

export function getProvincePrefix(name?: string | null): string {
  if (!name) return 'IDN'
  const clean = name.toLowerCase().trim()
  return PROVINCE_PREFIXES[clean] || clean.slice(0, 3).toUpperCase()
}

export const PROVINCE_CENTROIDS: Record<string, { latitude: number; longitude: number }> = {
  aceh: { latitude: 4.695135, longitude: 96.749399 },
  'sumatera utara': { latitude: 2.115355, longitude: 99.545097 },
  'sumatera barat': { latitude: -0.73994, longitude: 100.800005 },
  riau: { latitude: 0.293347, longitude: 101.706829 },
  'kepulauan riau': { latitude: 3.945651, longitude: 108.142867 },
  jambi: { latitude: -1.485183, longitude: 102.438058 },
  'sumatera selatan': { latitude: -3.319437, longitude: 104.914399 },
  'bangka belitung': { latitude: -2.741051, longitude: 106.440587 },
  'kepulauan bangka belitung': { latitude: -2.741051, longitude: 106.440587 },
  bengkulu: { latitude: -3.577847, longitude: 102.346388 },
  lampung: { latitude: -4.558585, longitude: 105.406808 },
  'dki jakarta': { latitude: -6.208763, longitude: 106.845599 },
  'jawa barat': { latitude: -6.917464, longitude: 107.619123 },
  banten: { latitude: -6.405817, longitude: 106.064018 },
  'jawa tengah': { latitude: -7.150975, longitude: 110.140259 },
  'di yogyakarta': { latitude: -7.79558, longitude: 110.36949 },
  'jawa timur': { latitude: -7.536064, longitude: 112.238402 },
  bali: { latitude: -8.409518, longitude: 115.188916 },
  'nusa tenggara barat': { latitude: -8.652933, longitude: 117.361648 },
  'nusa tenggara timur': { latitude: -8.657382, longitude: 121.079371 },
  'kalimantan barat': { latitude: -0.278781, longitude: 111.475285 },
  'kalimantan tengah': { latitude: -1.681488, longitude: 113.382355 },
  'kalimantan selatan': { latitude: -3.092642, longitude: 115.283759 },
  'kalimantan timur': { latitude: 0.538659, longitude: 116.419389 },
  'kalimantan utara': { latitude: 2.725947, longitude: 116.911009 },
  'sulawesi utara': { latitude: 0.624693, longitude: 123.975002 },
  gorontalo: { latitude: 0.699937, longitude: 122.446724 },
  'sulawesi tengah': { latitude: -1.430025, longitude: 121.445618 },
  'sulawesi barat': { latitude: -2.844137, longitude: 119.232078 },
  'sulawesi selatan': { latitude: -3.668799, longitude: 119.974053 },
  'sulawesi tenggara': { latitude: -4.14491, longitude: 122.174605 },
  maluku: { latitude: -3.238462, longitude: 130.145273 },
  'maluku utara': { latitude: 1.570999, longitude: 127.808769 },
  papua: { latitude: -4.269928, longitude: 138.080353 },
  'papua barat': { latitude: -1.336115, longitude: 133.174716 },
  'papua selatan': { latitude: -7.0, longitude: 139.5 },
  'papua tengah': { latitude: -3.8, longitude: 136.5 },
  'papua pegunungan': { latitude: -4.1, longitude: 138.9 },
  'papua barat daya': { latitude: -1.0, longitude: 131.5 }
}

export function getProvinceCentroid(name?: string): { latitude: number; longitude: number } | null {
  if (!name) return null
  const clean = name.toLowerCase().trim()
  return PROVINCE_CENTROIDS[clean] || null
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
