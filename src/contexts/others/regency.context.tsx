'use client'

import { createContext, useContext, useState } from 'react'

import type { RegencyRecord } from '@/types/others/regency'
import type { ReactElement, ReactNode } from 'react'

export type RegencyDialogType = 'add' | 'edit' | 'archive' | 'view' | null

export interface RegencyContextType {
  open: RegencyDialogType
  setOpen: (type: RegencyDialogType) => void
  currentRow: RegencyRecord | null
  setCurrentRow: (row: RegencyRecord | null) => void
  refreshData?: () => void
}

const RegencyContext = createContext<RegencyContextType | null>(null)

export interface RegencyProviderProps {
  children: ReactNode
  refreshData?: () => void
}

export function RegencyProvider({ children, refreshData }: RegencyProviderProps): ReactElement {
  const [open, setOpen] = useState<RegencyDialogType>(null)
  const [currentRow, setCurrentRow] = useState<RegencyRecord | null>(null)

  return (
    <RegencyContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        refreshData
      }}
    >
      {children}
    </RegencyContext.Provider>
  )
}

export function useRegency(): RegencyContextType {
  const ctx = useContext(RegencyContext)
  if (!ctx) {
    throw new Error('useRegency must be used within a RegencyProvider')
  }
  return ctx
}
