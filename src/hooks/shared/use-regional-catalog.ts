'use client'

import { useQuery } from '@tanstack/react-query'

import type { CatalogApiResponse, CatalogDistrict, CatalogProvince, CatalogRegency, CatalogVillage } from '@/types/data/indonesia-regions'

export const regionalCatalogKeys = {
  all: ['regional-catalog'] as const,
  provinces: () => [...regionalCatalogKeys.all, 'provinces'] as const,
  regencies: (params?: { provinceCode?: string; search?: string }) => [...regionalCatalogKeys.all, 'regencies', params] as const,
  districts: (params?: { regencyCode?: string; search?: string }) => [...regionalCatalogKeys.all, 'districts', params] as const,
  villages: (params?: { districtCode?: string; search?: string }) => [...regionalCatalogKeys.all, 'villages', params] as const
}

export function useCatalogProvincesQuery() {
  return useQuery({
    queryKey: regionalCatalogKeys.provinces(),
    queryFn: async (): Promise<CatalogProvince[]> => {
      const res = await fetch('/api/regions/provinces')
      if (!res.ok) throw new Error('Failed to fetch provinces catalog')
      const json = (await res.json()) as CatalogApiResponse<CatalogProvince[]>
      if (!json.success) throw new Error(json.error || 'Failed to parse provinces')
      return json.data
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24
  })
}

export interface UseCatalogRegenciesParams {
  provinceCode?: string
  search?: string
  enabled?: boolean
}

export function useCatalogRegenciesQuery({ provinceCode, search, enabled = true }: UseCatalogRegenciesParams = {}) {
  return useQuery({
    queryKey: regionalCatalogKeys.regencies({ provinceCode, search }),
    queryFn: async (): Promise<CatalogRegency[]> => {
      const params = new URLSearchParams()
      if (provinceCode) params.set('province_code', provinceCode)
      if (search) params.set('search', search)
      const res = await fetch(`/api/regions/regencies?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch regencies catalog')
      const json = (await res.json()) as CatalogApiResponse<CatalogRegency[]>
      if (!json.success) throw new Error(json.error || 'Failed to parse regencies')
      return json.data
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    enabled: enabled
  })
}

export interface UseCatalogDistrictsParams {
  regencyCode?: string
  search?: string
  enabled?: boolean
}

export function useCatalogDistrictsQuery({ regencyCode, search, enabled = true }: UseCatalogDistrictsParams = {}) {
  return useQuery({
    queryKey: regionalCatalogKeys.districts({ regencyCode, search }),
    queryFn: async (): Promise<CatalogDistrict[]> => {
      const params = new URLSearchParams()
      if (regencyCode) params.set('regency_code', regencyCode)
      if (search) params.set('search', search)
      const res = await fetch(`/api/regions/districts?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch districts catalog')
      const json = (await res.json()) as CatalogApiResponse<CatalogDistrict[]>
      if (!json.success) throw new Error(json.error || 'Failed to parse districts')
      return json.data
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    enabled: enabled
  })
}

export interface UseCatalogVillagesParams {
  districtCode?: string
  search?: string
  enabled?: boolean
}

export function useCatalogVillagesQuery({ districtCode, search, enabled = true }: UseCatalogVillagesParams = {}) {
  return useQuery({
    queryKey: regionalCatalogKeys.villages({ districtCode, search }),
    queryFn: async (): Promise<CatalogVillage[]> => {
      if (!districtCode) return []
      const params = new URLSearchParams({ district_code: districtCode })
      if (search) params.set('search', search)
      const res = await fetch(`/api/regions/villages?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch villages catalog')
      const json = (await res.json()) as CatalogApiResponse<CatalogVillage[]>
      if (!json.success) throw new Error(json.error || 'Failed to parse villages')
      return json.data
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    enabled: enabled && Boolean(districtCode)
  })
}
