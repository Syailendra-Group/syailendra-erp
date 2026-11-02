'use client'

import { createContext, useContext, useState } from 'react'

import type { CountryRecord } from '@/types/others/country'
import type { ReactElement, ReactNode } from 'react'

export type CountryDialogType = 'add' | 'edit' | 'archive' | 'view' | null

export interface CountryContextType {
  open: CountryDialogType
  setOpen: (type: CountryDialogType) => void
  currentRow: CountryRecord | null
  setCurrentRow: (row: CountryRecord | null) => void
  refreshData?: () => void
}

const CountryContext = createContext<CountryContextType | null>(null)

export interface CountryProviderProps {
  children: ReactNode
  refreshData?: () => void
}

export function CountryProvider({ children, refreshData }: CountryProviderProps): ReactElement {
  const [open, setOpen] = useState<CountryDialogType>(null)
  const [currentRow, setCurrentRow] = useState<CountryRecord | null>(null)

  return (
    <CountryContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        refreshData
      }}
    >
      {children}
    </CountryContext.Provider>
  )
}

export function useCountry(): CountryContextType {
  const ctx = useContext(CountryContext)
  if (!ctx) {
    throw new Error('useCountry must be used within a CountryProvider')
  }
  return ctx
}
