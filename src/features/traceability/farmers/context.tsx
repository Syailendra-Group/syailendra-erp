'use client'

import { createContext, useContext, useState } from 'react'

import type { ReactElement, ReactNode } from 'react'
import type { FarmerRecord } from './actions'

export type FarmersDialogType = 'add' | 'edit' | 'archive' | 'view' | null

export interface FarmersContextType {
  open: FarmersDialogType
  setOpen: (type: FarmersDialogType) => void
  currentRow: FarmerRecord | null
  setCurrentRow: (row: FarmerRecord | null) => void
  refreshData: () => void
}

const FarmersContext = createContext<FarmersContextType | null>(null)

export interface FarmersProviderProps {
  children: ReactNode
  refreshData: () => void
}

export function FarmersProvider({ children, refreshData }: FarmersProviderProps): ReactElement {
  const [open, setOpen] = useState<FarmersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<FarmerRecord | null>(null)

  return (
    <FarmersContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        refreshData
      }}
    >
      {children}
    </FarmersContext.Provider>
  )
}

export function useFarmers(): FarmersContextType {
  const ctx = useContext(FarmersContext)
  if (!ctx) {
    throw new Error('useFarmers must be used within a FarmersProvider')
  }
  return ctx
}
