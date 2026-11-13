'use client'

import { createContext, useCallback, useContext, useState } from 'react'

import type { DistrictRecord } from '@/types/others/district'
import type { ReactElement, ReactNode } from 'react'

export type DistrictDialogType = 'create' | 'add' | 'edit' | 'view' | 'delete' | null

export interface DistrictContextType {
  open: DistrictDialogType
  setOpen: (type: DistrictDialogType) => void
  currentRow: DistrictRecord | null
  setCurrentRow: (row: DistrictRecord | null) => void
  refreshData?: () => void
  handleCreate: () => void
  handleEdit: (row: DistrictRecord) => void
  handleView: (row: DistrictRecord) => void
  handleDelete: (row: DistrictRecord) => void
}

const DistrictContext = createContext<DistrictContextType | null>(null)

export interface DistrictProviderProps {
  children: ReactNode
  refreshData?: () => void
}

export function DistrictProvider({ children, refreshData }: DistrictProviderProps): ReactElement {
  const [open, setOpen] = useState<DistrictDialogType>(null)
  const [currentRow, setCurrentRow] = useState<DistrictRecord | null>(null)

  const handleCreate = useCallback(() => {
    setCurrentRow(null)
    setOpen('create')
  }, [])

  const handleEdit = useCallback((row: DistrictRecord) => {
    setCurrentRow(row)
    setOpen('edit')
  }, [])

  const handleView = useCallback((row: DistrictRecord) => {
    setCurrentRow(row)
    setOpen('view')
  }, [])

  const handleDelete = useCallback((row: DistrictRecord) => {
    setCurrentRow(row)
    setOpen('delete')
  }, [])

  return (
    <DistrictContext.Provider
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
    </DistrictContext.Provider>
  )
}

export function useDistrict(): DistrictContextType {
  const ctx = useContext(DistrictContext)
  if (!ctx) {
    throw new Error('useDistrict must be used within a DistrictProvider')
  }
  return ctx
}
