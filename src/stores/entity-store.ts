import { create } from 'zustand'

export type SyailendraEntityId = 'sbi' | 'spba' | 'sammend' | 'sg'

export interface SyailendraEntity {
  id: SyailendraEntityId
  code: string
  name: string
  roleKey: string
  pillars: string[]
}

export const SYAILENDRA_ENTITIES: SyailendraEntity[] = [
  {
    id: 'sbi',
    code: 'PT SBI',
    name: 'PT Syailendra Bumi Investama',
    roleKey: 'entities.sbiRole',
    pillars: ['main', 'ftm', 'hrm', 'scm', 'others']
  },
  {
    id: 'spba',
    code: 'PT SPBA',
    name: 'PT Syailendra Prima Agro',
    roleKey: 'entities.spbaRole',
    pillars: ['wms']
  },
  {
    id: 'sammend',
    code: 'PT SAMMEND',
    name: 'PT Syailendra Aroma Mandiri',
    roleKey: 'entities.sammendRole',
    pillars: ['crm', 'dcm', 'ai']
  },
  {
    id: 'sg',
    code: 'PT SG',
    name: 'PT Syailendra Group',
    roleKey: 'entities.sgRole',
    pillars: ['imm']
  }
]

export interface EntityState {
  activeEntityId: SyailendraEntityId
  setActiveEntityId: (entityId: SyailendraEntityId) => void
}

export const useEntityStore = create<EntityState>((set) => ({
  activeEntityId: 'sbi',
  setActiveEntityId: (entityId: SyailendraEntityId) => set({ activeEntityId: entityId })
}))
