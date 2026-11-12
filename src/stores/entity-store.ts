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
}

export const SYAILENDRA_ENTITIES: SyailendraEntity[] = [
  {
    id: 'sbi',
    code: 'PT SBI',
    name: 'PT Syailendra Bumi Investama',
    roleKey: 'entities.sbiRole',
    odooCompanyId: 1,
    pillars: ['main', 'ftm', 'hrm', 'scm', 'others'],
    defaultRoute: '/overview'
  },
  {
    id: 'spba',
    code: 'PT SPBA',
    name: 'PT Syailendra Prima Agro',
    roleKey: 'entities.spbaRole',
    odooCompanyId: 2,
    pillars: ['wms'],
    defaultRoute: '/wms'
  },
  {
    id: 'sammend',
    code: 'PT SAMMEND',
    name: 'PT Syailendra Aroma Mandiri',
    roleKey: 'entities.sammendRole',
    odooCompanyId: 3,
    pillars: ['crm', 'dcm', 'ai'],
    defaultRoute: '/crm'
  },
  {
    id: 'sg',
    code: 'PT SG',
    name: 'PT Syailendra Group',
    roleKey: 'entities.sgRole',
    odooCompanyId: 4,
    pillars: ['imm'],
    defaultRoute: '/imm'
  }
]

/**
 * Resolves the owning business entity for any module pillar tab.
 */
export function resolveEntityByTab(tab: ModuleTab): SyailendraEntity {
  return SYAILENDRA_ENTITIES.find((entity) => entity.pillars.includes(tab)) || SYAILENDRA_ENTITIES[0]
}

interface EntityState {
  activeEntityId: SyailendraEntityId
  setActiveEntityId: (id: SyailendraEntityId) => void
  getActiveEntity: () => SyailendraEntity
}

export const useEntityStore = create<EntityState>()(
  persist(
    (set, get) => ({
      activeEntityId: 'sbi',
      setActiveEntityId: (id) => set({ activeEntityId: id }),
      getActiveEntity: () => SYAILENDRA_ENTITIES.find((e) => e.id === get().activeEntityId) || SYAILENDRA_ENTITIES[0]
    }),
    {
      name: 'syailendra-active-entity',
      partialize: (state) => ({ activeEntityId: state.activeEntityId })
    }
  )
)
