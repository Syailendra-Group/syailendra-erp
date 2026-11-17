'use client'

import { createContext, useCallback, useContext, useState } from 'react'

import type { DistilleryRecord } from '@/types/scm/distillery'
import type { ReactElement, ReactNode } from 'react'

export type DistilleriesDialogType = 'add' | 'create' | 'edit' | 'archive' | 'view' | null

export interface DistilleriesContextType {
  open: DistilleriesDialogType
  setOpen: (type: DistilleriesDialogType) => void
  currentRow: DistilleryRecord | null
  setCurrentRow: (row: DistilleryRecord | null) => void
  refreshData?: () => void
  handleCreate: () => void
  handleEdit: (row: DistilleryRecord) => void
  handleView: (row: DistilleryRecord) => void
  handleDelete: (row: DistilleryRecord) => void
}

const DistilleriesContext = createContext<DistilleriesContextType | null>(null)

export interface DistilleriesProviderProps {
  children: ReactNode
  refreshData?: () => void
}

export function DistilleriesProvider({ children, refreshData }: DistilleriesProviderProps): ReactElement {
  const [open, setOpen] = useState<DistilleriesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<DistilleryRecord | null>(null)

  const handleCreate = useCallback(() => {
    setCurrentRow(null)
    setOpen('create')
  }, [])

  const handleEdit = useCallback((row: DistilleryRecord) => {
    setCurrentRow(row)
    setOpen('edit')
  }, [])

  const handleView = useCallback((row: DistilleryRecord) => {
    setCurrentRow(row)
    setOpen('view')
  }, [])

  const handleDelete = useCallback((row: DistilleryRecord) => {
    setCurrentRow(row)
    setOpen('archive')
  }, [])

  return (
    <DistilleriesContext.Provider
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
    </DistilleriesContext.Provider>
  )
}

export function useDistilleries(): DistilleriesContextType {
  const ctx = useContext(DistilleriesContext)
  if (!ctx) {
    throw new Error('useDistilleries must be used within a DistilleriesProvider')
  }
  return ctx
}
