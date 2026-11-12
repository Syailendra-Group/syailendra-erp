'use client'

import { createContext, useCallback, useContext, useState } from 'react'

import type { CountryRecord } from '@/types/sbi/others/country'
import type { ReactElement, ReactNode } from 'react'

export type CountryDialogType = 'create' | 'add' | 'edit' | 'view' | 'delete' | null

export interface CountryContextType {
  open: CountryDialogType
  setOpen: (type: CountryDialogType) => void
  currentRow: CountryRecord | null
  setCurrentRow: (row: CountryRecord | null) => void
  refreshData?: () => void
  handleCreate: () => void
  handleEdit: (row: CountryRecord) => void
  handleView: (row: CountryRecord) => void
  handleDelete: (row: CountryRecord) => void
}

const CountryContext = createContext<CountryContextType | null>(null)

export interface CountryProviderProps {
  children: ReactNode
  refreshData?: () => void
}

export function CountryProvider({ children, refreshData }: CountryProviderProps): ReactElement {
  const [open, setOpen] = useState<CountryDialogType>(null)
  const [currentRow, setCurrentRow] = useState<CountryRecord | null>(null)

  const handleCreate = useCallback(() => {
    setCurrentRow(null)
    setOpen('create')
  }, [])

  const handleEdit = useCallback((row: CountryRecord) => {
    setCurrentRow(row)
    setOpen('edit')
  }, [])

  const handleView = useCallback((row: CountryRecord) => {
    setCurrentRow(row)
    setOpen('view')
  }, [])

  const handleDelete = useCallback((row: CountryRecord) => {
    setCurrentRow(row)
    setOpen('delete')
  }, [])

  return (
    <CountryContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        refreshData,
        handleCreate,
        handleEdit,
        handleView,
        handleDelete
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
