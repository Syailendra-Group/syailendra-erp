'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { SiteConfigRecord } from '@/types/others/website'

interface SiteState {
  config: SiteConfigRecord | null
  setConfig: (config: SiteConfigRecord) => void
}

/** Persisted shape excludes logo base64 payloads: three logos exceed the localStorage quota and break rendering. */
type PersistedSiteConfig = Omit<SiteConfigRecord, 'logo_light' | 'logo_dark' | 'logo_monogram'>

function toPersistedConfig(config: SiteConfigRecord | null): PersistedSiteConfig | null {
  if (!config) return null
  return {
    id: config.id,
    site_name: config.site_name,
    company_name: config.company_name,
    site_descriptor: config.site_descriptor,
    login_tagline: config.login_tagline,
    login_card_title: config.login_card_title,
    login_card_description: config.login_card_description,
    footer_backbone: config.footer_backbone,
    copyright_text: config.copyright_text,
    primary_light: config.primary_light,
    primary_dark: config.primary_dark,
    bg_light: config.bg_light,
    bg_dark: config.bg_dark,
    accent_gold: config.accent_gold
  }
}

/**
 * ponytail: quota-safe storage — a failed write degrades to in-memory only instead of throwing inside React.
 * Upgrade path: serve logos from a CDN/object endpoint once backend hosting exists.
 */
const safeStorage = createJSONStorage(() => ({
  getItem: (name: string): string | null => {
    try {
      return window.localStorage.getItem(name)
    } catch {
      /* private mode or storage disabled — fall back to fetch */
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      window.localStorage.setItem(name, value)
    } catch {
      /* QuotaExceededError: state stays in memory, rendering never breaks */
    }
  },
  removeItem: (name: string): void => {
    try {
      window.localStorage.removeItem(name)
    } catch {
      /* ignore */
    }
  }
}))

export const useSiteStore = create<SiteState>()(
  persist(
    (set) => ({
      config: null,
      setConfig: (config) => set({ config })
    }),
    {
      name: 'syailendra-site-store',
      version: 2,
      storage: safeStorage,
      partialize: (state) => ({ config: toPersistedConfig(state.config) }),
      migrate: (persisted) => {
        const legacy = persisted as { config?: SiteConfigRecord | null } | undefined
        return { config: toPersistedConfig(legacy?.config ?? null) }
      }
    }
  )
)
