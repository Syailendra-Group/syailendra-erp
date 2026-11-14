'use client'

import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getSiteConfigAction, resetSiteConfigAction, saveSiteConfigAction } from '@/actions/others/website.action'
import { useSiteStore } from '@/stores/site-store'

import type { SiteConfigRecord, UpdateSiteConfigPayload } from '@/types/others/website'

export const SITE_CONFIG_QUERY_KEY = ['site-config'] as const

export function useSiteConfigQuery() {
  return useQuery<SiteConfigRecord>({
    queryKey: SITE_CONFIG_QUERY_KEY,
    queryFn: () => getSiteConfigAction(),
    staleTime: 60_000
  })
}

export function useSaveSiteConfigMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateSiteConfigPayload) => saveSiteConfigAction(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: SITE_CONFIG_QUERY_KEY })
      }
    }
  })
}

export function useResetSiteConfigMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => resetSiteConfigAction(),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: SITE_CONFIG_QUERY_KEY })
      }
    }
  })
}

/**
 * Hydrates global site config & injects dynamic CSS theme variables into DOM
 */
export function useSiteConfigHydration(): void {
  const { data } = useSiteConfigQuery()
  const setConfig = useSiteStore((s) => s.setConfig)

  useEffect(() => {
    if (!data) return
    setConfig(data)

    // Inject or update dynamic CSS variables in document head
    let styleEl = document.getElementById('syailendra-dynamic-theme') as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = 'syailendra-dynamic-theme'
      document.head.appendChild(styleEl)
    }

    styleEl.textContent = `
:root {
  --brand-primary: ${data.primary_light};
  --primary: ${data.primary_light};
  --ring: ${data.primary_light};
  --background: ${data.bg_light};
  --brand-gold: ${data.accent_gold};
  --sidebar-primary: ${data.accent_gold};
}
.dark {
  --brand-primary: ${data.primary_dark};
  --primary: ${data.primary_dark};
  --background: ${data.bg_dark};
}
`
  }, [data, setConfig])
}
