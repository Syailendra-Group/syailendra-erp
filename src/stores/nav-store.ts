import { create } from 'zustand'

export type ModuleTab = 'main' | 'ftm' | 'hrm' | 'scm' | 'wms' | 'crm' | 'dcm' | 'ai' | 'imm' | 'others'

export interface NavState {
  activeTab: ModuleTab
  setActiveTab: (tab: ModuleTab) => void
}

export const useNavStore = create<NavState>((set) => ({
  activeTab: 'main',
  setActiveTab: (tab: ModuleTab) => set({ activeTab: tab })
}))
