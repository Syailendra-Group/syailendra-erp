import { create } from 'zustand'

export type ModuleTab = 'inventory' | 'crm' | 'hr' | 'employees'

export interface NavState {
  activeTab: ModuleTab
  setActiveTab: (tab: ModuleTab) => void
}

export const useNavStore = create<NavState>((set) => ({
  activeTab: 'inventory',
  setActiveTab: (tab: ModuleTab) => set({ activeTab: tab })
}))
