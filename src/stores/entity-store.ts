'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { ModuleTab } from './nav-store'

export type SyailendraEntityId = 'sg' | 'sbi' | 'spba' | 'sammend'

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

const PILLAR_ROUTE_MAP: Record<ModuleTab, string> = {
  ftm: '/ftm',
  hrm: '/hris',
  scm: '/scm',
  wms: '/wms',
  crm: '/crm',
  dcm: '/dcm',
  ai: '/ai',
  imm: '/imm',
  others: '/others'
}

export function resolveRouteByPillar(pillar?: ModuleTab): string {
  if (!pillar) return '/ftm'
  return PILLAR_ROUTE_MAP[pillar] || '/ftm'
}

export function syncDefaultRouteCookie(route: string): void {
  if (typeof document !== 'undefined') {
    document.cookie = `syailendra_default_route=${encodeURIComponent(route)}; path=/; max-age=2592000; SameSite=Lax`
  }
}

export const INITIAL_SYAILENDRA_ENTITIES: SyailendraEntity[] = [
  {
    id: 'sg',
    code: 'SG',
    name: 'SYAILENDRA GROUP',
    roleKey: 'entities.sgRole',
    odooCompanyId: 4,
    pillars: ['imm', 'others'],
    defaultRoute: '/imm',
    logoBase64: null
  },
  {
    id: 'sbi',
    code: 'PT SBI',
    name: 'PT SYAILENDRA BUMI INVESTAMA',
    roleKey: 'entities.sbiRole',
    odooCompanyId: 1,
    pillars: ['ftm', 'hrm', 'scm'],
    defaultRoute: '/ftm',
    logoBase64: null
  },
  {
    id: 'spba',
    code: 'PT SPBA',
    name: 'PT SYAILENDRA PABRIK BERSAMA',
    roleKey: 'entities.spbaRole',
    odooCompanyId: 2,
    pillars: ['wms'],
    defaultRoute: '/wms',
    logoBase64: null
  },
  {
    id: 'sammend',
    code: 'PT SAMMEND',
    name: 'PT SYAILENDRA MAHAKARYA MENDUNIA',
    roleKey: 'entities.sammendRole',
    odooCompanyId: 3,
    pillars: ['crm', 'dcm', 'ai'],
    defaultRoute: '/crm',
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
  updateEntityIdentity: (odooCompanyId: number, payload: { name?: string; code?: string; logoBase64?: string | null }) => void
  syncEntitiesFromOdoo: (records: { id: number; name: string; short_name?: string; logo_web: string | null; enabled_pillars: ModuleTab[] }[]) => void
}

export const useEntityStore = create<EntityState>()(
  persist(
    (set, get) => ({
      activeEntityId: 'sg',
      entities: INITIAL_SYAILENDRA_ENTITIES,
      setActiveEntityId: (id) => {
        const entity = get().entities.find((e) => e.id === id)
        if (entity) {
          syncDefaultRouteCookie(resolveRouteByPillar(entity.pillars[0]))
        }
        set({ activeEntityId: id })
      },
      getActiveEntity: () => {
        const state = get()
        return state.entities.find((e) => e.id === state.activeEntityId) || state.entities[0] || INITIAL_SYAILENDRA_ENTITIES[0]
      },
      updateEntityPillars: (odooCompanyId, pillars) => {
        set((state) => ({
          entities: state.entities.map((e) =>
            e.odooCompanyId === odooCompanyId ? { ...e, pillars, defaultRoute: resolveRouteByPillar(pillars[0]) } : e
          )
        }))
      },
      updateEntityLogo: (odooCompanyId, logoBase64) => {
        set((state) => ({
          entities: state.entities.map((e) => (e.odooCompanyId === odooCompanyId ? { ...e, logoBase64 } : e))
        }))
      },
      updateEntityIdentity: (odooCompanyId, payload) => {
        set((state) => ({
          entities: state.entities.map((e) =>
            e.odooCompanyId === odooCompanyId
              ? {
                  ...e,
                  name: payload.name || e.name,
                  code: payload.code || e.code,
                  logoBase64: payload.logoBase64 !== undefined ? payload.logoBase64 : e.logoBase64
                }
              : e
          )
        }))
      },
      syncEntitiesFromOdoo: (records) => {
        set((state) => {
          const baseMap = new Map(INITIAL_SYAILENDRA_ENTITIES.map((e) => [e.odooCompanyId, e]))
          const prevMap = new Map(state.entities.map((e) => [e.odooCompanyId, e]))

          const orderedEntities: SyailendraEntity[] = []
          for (const rec of records) {
            const base = prevMap.get(rec.id) || baseMap.get(rec.id)
            if (!base) continue
            const nextPillars = rec.enabled_pillars.length > 0 ? rec.enabled_pillars : base.pillars
            const nextCode = (rec.short_name || '').trim() || base.code
            orderedEntities.push({
              ...base,
              name: rec.name || base.name,
              code: nextCode,
              pillars: nextPillars,
              defaultRoute: resolveRouteByPillar(nextPillars[0]),
              logoBase64: rec.logo_web !== undefined ? rec.logo_web : base.logoBase64
            })
          }

          return {
            entities: orderedEntities.length > 0 ? orderedEntities : INITIAL_SYAILENDRA_ENTITIES
          }
        })
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
