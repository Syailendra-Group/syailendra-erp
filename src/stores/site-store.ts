'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { SiteConfigRecord } from '@/types/others/website'

interface SiteState {
  config: SiteConfigRecord | null
  setConfig: (config: SiteConfigRecord) => void
}

export const useSiteStore = create<SiteState>()(
  persist(
    (set) => ({
      config: null,
      setConfig: (config) => set({ config })
    }),
    {
      name: 'syailendra-site-store'
    }
  )
)
