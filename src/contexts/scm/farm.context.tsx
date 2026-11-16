/**
 * farm.context.tsx — Dialog state provider for Farm / Terroir Master
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { createContext, useCallback, useContext, useState } from 'react'

import type { FarmRecord } from '@/types/scm/farm'
import type { ReactElement, ReactNode } from 'react'

export type FarmDialogType = 'view' | 'delete' | null

export interface FarmContextType {
  open: FarmDialogType
  setOpen: (type: FarmDialogType) => void
  selectedFarm: FarmRecord | null
  setSelectedFarm: (farm: FarmRecord | null) => void
  handleView: (farm: FarmRecord) => void
  handleDelete: (farm: FarmRecord) => void
}

const FarmContext = createContext<FarmContextType | null>(null)

export function FarmProvider({ children }: { children: ReactNode }): ReactElement {
  const [open, setOpen] = useState<FarmDialogType>(null)
  const [selectedFarm, setSelectedFarm] = useState<FarmRecord | null>(null)

  const handleView = useCallback((farm: FarmRecord) => {
    setSelectedFarm(farm)
    setOpen('view')
  }, [])

  const handleDelete = useCallback((farm: FarmRecord) => {
    setSelectedFarm(farm)
    setOpen('delete')
  }, [])

  return <FarmContext.Provider value={{ open, setOpen, selectedFarm, setSelectedFarm, handleView, handleDelete }}>{children}</FarmContext.Provider>
}

export function useFarmContext(): FarmContextType {
  const context = useContext(FarmContext)
  if (!context) {
    throw new Error('useFarmContext must be used within a FarmProvider')
  }
  return context
}
