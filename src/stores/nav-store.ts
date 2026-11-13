import { create } from 'zustand'

export type ModuleTab = 'ftm' | 'hrm' | 'scm' | 'wms' | 'crm' | 'dcm' | 'ai' | 'imm' | 'others'

export interface NavState {
  activeTab: ModuleTab
  setActiveTab: (tab: ModuleTab) => void
}

export const useNavStore = create<NavState>((set) => ({
  activeTab: 'ftm',
  setActiveTab: (tab: ModuleTab) => set({ activeTab: tab })
}))
