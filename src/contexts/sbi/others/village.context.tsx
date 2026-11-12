'use client'

import { createContext, useCallback, useContext, useState } from 'react'

import type { VillageRecord } from '@/types/sbi/others/village'
import type { ReactElement, ReactNode } from 'react'

export type VillageDialogType = 'create' | 'add' | 'edit' | 'view' | 'delete' | null

export interface VillageContextType {
  open: VillageDialogType
  setOpen: (type: VillageDialogType) => void
  currentRow: VillageRecord | null
  setCurrentRow: (row: VillageRecord | null) => void
  refreshData?: () => void
  handleCreate: () => void
  handleEdit: (row: VillageRecord) => void
  handleView: (row: VillageRecord) => void
  handleDelete: (row: VillageRecord) => void
}

const VillageContext = createContext<VillageContextType | null>(null)

export interface VillageProviderProps {
  children: ReactNode
  refreshData?: () => void
}

export function VillageProvider({ children, refreshData }: VillageProviderProps): ReactElement {
  const [open, setOpen] = useState<VillageDialogType>(null)
  const [currentRow, setCurrentRow] = useState<VillageRecord | null>(null)

  const handleCreate = useCallback(() => {
    setCurrentRow(null)
    setOpen('create')
  }, [])

  const handleEdit = useCallback((row: VillageRecord) => {
    setCurrentRow(row)
    setOpen('edit')
  }, [])

  const handleView = useCallback((row: VillageRecord) => {
    setCurrentRow(row)
    setOpen('view')
  }, [])

  const handleDelete = useCallback((row: VillageRecord) => {
    setCurrentRow(row)
    setOpen('delete')
  }, [])

  return (
    <VillageContext.Provider
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
    </VillageContext.Provider>
  )
}

export function useVillage(): VillageContextType {
  const ctx = useContext(VillageContext)
  if (!ctx) {
    throw new Error('useVillage must be used within a VillageProvider')
  }
  return ctx
}
