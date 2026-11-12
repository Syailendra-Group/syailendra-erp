'use client'

import { createContext, useCallback, useContext, useState } from 'react'

import type { RegencyRecord } from '@/types/sbi/others/regency'
import type { ReactElement, ReactNode } from 'react'

export type RegencyDialogType = 'create' | 'add' | 'edit' | 'view' | 'delete' | null

export interface RegencyContextType {
  open: RegencyDialogType
  setOpen: (type: RegencyDialogType) => void
  currentRow: RegencyRecord | null
  setCurrentRow: (row: RegencyRecord | null) => void
  refreshData?: () => void
  handleCreate: () => void
  handleEdit: (row: RegencyRecord) => void
  handleView: (row: RegencyRecord) => void
  handleDelete: (row: RegencyRecord) => void
}

const RegencyContext = createContext<RegencyContextType | null>(null)

export interface RegencyProviderProps {
  children: ReactNode
  refreshData?: () => void
}

export function RegencyProvider({ children, refreshData }: RegencyProviderProps): ReactElement {
  const [open, setOpen] = useState<RegencyDialogType>(null)
  const [currentRow, setCurrentRow] = useState<RegencyRecord | null>(null)

  const handleCreate = useCallback(() => {
    setCurrentRow(null)
    setOpen('create')
  }, [])

  const handleEdit = useCallback((row: RegencyRecord) => {
    setCurrentRow(row)
    setOpen('edit')
  }, [])

  const handleView = useCallback((row: RegencyRecord) => {
    setCurrentRow(row)
    setOpen('view')
  }, [])

  const handleDelete = useCallback((row: RegencyRecord) => {
    setCurrentRow(row)
    setOpen('delete')
  }, [])

  return (
    <RegencyContext.Provider
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
