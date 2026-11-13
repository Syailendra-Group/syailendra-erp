'use client'

import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getCompaniesAction, saveCompanyAction, savePillarAllocationAction } from '@/actions/others/company.action'
import { useEntityStore } from '@/stores/entity-store'

import type { CompanyRecord, PillarAllocationEntry, UpdateCompanyPayload } from '@/types/others/company'

export const COMPANIES_QUERY_KEY = ['companies-list'] as const

export function useCompaniesQuery() {
  return useQuery<{ companies: CompanyRecord[] }>({
    queryKey: COMPANIES_QUERY_KEY,
    queryFn: () => getCompaniesAction(),
    staleTime: 60_000
  })
}

export function useSaveCompanyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateCompanyPayload) => saveCompanyAction(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: COMPANIES_QUERY_KEY })
      }
    }
  })
}

export function useSavePillarAllocationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entries: PillarAllocationEntry[]) => savePillarAllocationAction(entries),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: COMPANIES_QUERY_KEY })
      }
    }
  })
}

/**
 * Global hydration: keeps the entity store (switcher, sidebar pillars, logos, short names)
 * aligned with the backend company records on every authenticated page.
 */
export function useCompaniesHydration(): void {
  const { data } = useCompaniesQuery()
  const syncEntitiesFromOdoo = useEntityStore((s) => s.syncEntitiesFromOdoo)

  useEffect(() => {
    const companies = data?.companies
    if (!companies || companies.length === 0) return
    syncEntitiesFromOdoo(
      companies.map((c) => ({
        id: c.id,
        name: c.name,
        short_name: c.short_name,
        logo_web: c.logo_web,
        enabled_pillars: c.enabled_pillars
      }))
    )
  }, [data, syncEntitiesFromOdoo])
}
