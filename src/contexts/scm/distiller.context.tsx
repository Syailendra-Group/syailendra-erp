'use client'

import { createContext, useCallback, useContext, useState } from 'react'

import type { DistillerRecord } from '@/types/scm/distiller'
import type { ReactElement, ReactNode } from 'react'

export type DistillersDialogType = 'add' | 'edit' | 'archive' | 'view' | null

export interface DistillersContextType {
  open: DistillersDialogType
  setOpen: (type: DistillersDialogType) => void
  currentRow: DistillerRecord | null
  setCurrentRow: (row: DistillerRecord | null) => void
  refreshData?: () => void
  handleCreate: () => void
  handleEdit: (row: DistillerRecord) => void
  handleView: (row: DistillerRecord) => void
  handleDelete: (row: DistillerRecord) => void
}

const DistillersContext = createContext<DistillersContextType | null>(null)

export interface DistillersProviderProps {
  children: ReactNode
  refreshData?: () => void
}

export function DistillersProvider({ children, refreshData }: DistillersProviderProps): ReactElement {
  const [open, setOpen] = useState<DistillersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<DistillerRecord | null>(null)

  const handleCreate = useCallback(() => {
    setCurrentRow(null)
    setOpen('add')
  }, [])

  const handleEdit = useCallback((row: DistillerRecord) => {
    setCurrentRow(row)
    setOpen('edit')
  }, [])

  const handleView = useCallback((row: DistillerRecord) => {
    setCurrentRow(row)
    setOpen('view')
  }, [])

  const handleDelete = useCallback((row: DistillerRecord) => {
    setCurrentRow(row)
    setOpen('archive')
  }, [])

  return (
    <DistillersContext.Provider
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
    </DistillersContext.Provider>
  )
}

export function useDistillers(): DistillersContextType {
  const ctx = useContext(DistillersContext)
  if (!ctx) {
    throw new Error('useDistillers must be used within a DistillersProvider')
  }
  return ctx
}
