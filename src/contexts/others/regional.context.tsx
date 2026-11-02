'use client'

import { createContext, useContext, useState } from 'react'

import type { ReactElement, ReactNode } from 'react'

export type RegionalDialogType = 'add' | 'edit' | 'archive' | 'view' | null

export interface RegionalContextType<T = unknown> {
  open: RegionalDialogType
  setOpen: (type: RegionalDialogType) => void
  currentRow: T | null
  setCurrentRow: (row: T | null) => void
  refreshData?: () => void
}

const RegionalContext = createContext<RegionalContextType<unknown> | null>(null)

export interface RegionalProviderProps {
  children: ReactNode
  refreshData?: () => void
}

export function RegionalProvider<T = unknown>({ children, refreshData }: RegionalProviderProps): ReactElement {
  const [open, setOpen] = useState<RegionalDialogType>(null)
  const [currentRow, setCurrentRow] = useState<T | null>(null)

  return (
    <RegionalContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow: setCurrentRow as (row: unknown) => void,
        refreshData
      }}
    >
      {children}
    </RegionalContext.Provider>
  )
}

export function useRegional<T = unknown>(): RegionalContextType<T> {
  const ctx = useContext(RegionalContext)
  if (!ctx) {
    throw new Error('useRegional must be used within a RegionalProvider')
  }
  return ctx as RegionalContextType<T>
}
