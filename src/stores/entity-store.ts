'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { ModuleTab } from './nav-store'

export type SyailendraEntityId = 'sbi' | 'spba' | 'sammend' | 'sg'

export interface SyailendraEntity {
  id: SyailendraEntityId
  code: string
  name: string
  roleKey: string
  odooCompanyId: number
  pillars: ModuleTab[]
  defaultRoute: string
  logoBase64?: string | null
}

export const INITIAL_SYAILENDRA_ENTITIES: SyailendraEntity[] = [
  {
    id: 'sbi',
    code: 'PT SBI',
    name: 'PT Syailendra Bumi Investama',
    roleKey: 'entities.sbiRole',
    odooCompanyId: 1,
    pillars: ['main', 'ftm', 'hrm', 'scm', 'others'],
    defaultRoute: '/overview',
    logoBase64: null
  },
  {
    id: 'spba',
    code: 'PT SPBA',
    name: 'PT Syailendra Prima Agro',
    roleKey: 'entities.spbaRole',
    odooCompanyId: 2,
    pillars: ['wms'],
    defaultRoute: '/wms',
    logoBase64: null
  },
  {
    id: 'sammend',
    code: 'PT SAMMEND',
    name: 'PT Syailendra Aroma Mandiri',
    roleKey: 'entities.sammendRole',
    odooCompanyId: 3,
    pillars: ['crm', 'dcm', 'ai'],
    defaultRoute: '/crm',
    logoBase64: null
  },
  {
    id: 'sg',
    code: 'PT SG',
    name: 'PT Syailendra Group',
    roleKey: 'entities.sgRole',
    odooCompanyId: 4,
    pillars: ['imm'],
    defaultRoute: '/imm',
    logoBase64: null
  }
]

export const SYAILENDRA_ENTITIES = INITIAL_SYAILENDRA_ENTITIES

interface EntityState {
  activeEntityId: SyailendraEntityId
  entities: SyailendraEntity[]
  setActiveEntityId: (id: SyailendraEntityId) => void
  getActiveEntity: () => SyailendraEntity
  updateEntityPillars: (odooCompanyId: number, pillars: ModuleTab[]) => void
  updateEntityLogo: (odooCompanyId: number, logoBase64: string | null) => void
  syncEntitiesFromOdoo: (records: { id: number; name: string; logo_web: string | null; enabled_pillars: ModuleTab[] }[]) => void
}

export const useEntityStore = create<EntityState>()(
  persist(
    (set, get) => ({
      activeEntityId: 'sbi',
      entities: INITIAL_SYAILENDRA_ENTITIES,
      setActiveEntityId: (id) => set({ activeEntityId: id }),
      getActiveEntity: () => {
        const state = get()
        return state.entities.find((e) => e.id === state.activeEntityId) || state.entities[0] || INITIAL_SYAILENDRA_ENTITIES[0]
      },
      updateEntityPillars: (odooCompanyId, pillars) => {
        set((state) => ({
          entities: state.entities.map((e) => (e.odooCompanyId === odooCompanyId ? { ...e, pillars } : e))
        }))
      },
      updateEntityLogo: (odooCompanyId, logoBase64) => {
        set((state) => ({
          entities: state.entities.map((e) => (e.odooCompanyId === odooCompanyId ? { ...e, logoBase64 } : e))
        }))
      },
      syncEntitiesFromOdoo: (records) => {
        set((state) => ({
          entities: state.entities.map((e) => {
            const found = records.find((r) => r.id === e.odooCompanyId)
            if (!found) return e
            return {
              ...e,
              name: found.name || e.name,
              pillars: found.enabled_pillars.length > 0 ? found.enabled_pillars : e.pillars,
              logoBase64: found.logo_web !== undefined ? found.logo_web : e.logoBase64
            }
          })
        }))
      }
    }),
    {
      name: 'syailendra-active-entity',
      partialize: (state) => ({ activeEntityId: state.activeEntityId, entities: state.entities })
    }
  )
)

export function resolveEntityByTab(tab: ModuleTab): SyailendraEntity {
  const state = useEntityStore.getState()
  return state.entities.find((entity) => entity.pillars.includes(tab)) || state.entities[0] || INITIAL_SYAILENDRA_ENTITIES[0]
}
