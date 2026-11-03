'use client'

import { createContext, useContext, useState } from 'react'

import type { CountryRecord } from '@/types/others/country'
import type { PropsWithChildren, ReactElement } from 'react'

export type CountryDialogType = 'create' | 'add' | 'edit' | 'view' | 'delete' | null

export interface CountryContextType {
  open: CountryDialogType
  setOpen: (type: CountryDialogType) => void
  currentRow: CountryRecord | null
  setCurrentRow: (item: CountryRecord | null) => void
}

const CountryContext = createContext<CountryContextType | null>(null)

export function CountryProvider({ children }: PropsWithChildren): ReactElement {
  const [open, setOpen] = useState<CountryDialogType>(null)
  const [currentRow, setCurrentRow] = useState<CountryRecord | null>(null)

  return (
    <CountryContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow
      }}
    >
      {children}
    </CountryContext.Provider>
  )
}

export function useCountry(): CountryContextType {
  const context = useContext(CountryContext)
  if (!context) {
    throw new Error('useCountry must be used within a CountryProvider')
  }
  return context
}
