'use client'

import { createContext, useCallback, useContext, useState } from 'react'

import type { ProvinceRecord } from '@/types/sbi/others/province'
import type { ReactElement, ReactNode } from 'react'

export type ProvinceDialogType = 'create' | 'add' | 'edit' | 'view' | 'delete' | null

export interface ProvinceContextType {
  open: ProvinceDialogType
  setOpen: (type: ProvinceDialogType) => void
  currentRow: ProvinceRecord | null
  setCurrentRow: (row: ProvinceRecord | null) => void
  refreshData?: () => void
  handleCreate: () => void
  handleEdit: (row: ProvinceRecord) => void
  handleView: (row: ProvinceRecord) => void
  handleDelete: (row: ProvinceRecord) => void
}

const ProvinceContext = createContext<ProvinceContextType | null>(null)

export interface ProvinceProviderProps {
  children: ReactNode
  refreshData?: () => void
}

export function ProvinceProvider({ children, refreshData }: ProvinceProviderProps): ReactElement {
  const [open, setOpen] = useState<ProvinceDialogType>(null)
  const [currentRow, setCurrentRow] = useState<ProvinceRecord | null>(null)

  const handleCreate = useCallback(() => {
    setCurrentRow(null)
    setOpen('create')
  }, [])

  const handleEdit = useCallback((row: ProvinceRecord) => {
    setCurrentRow(row)
    setOpen('edit')
  }, [])

  const handleView = useCallback((row: ProvinceRecord) => {
    setCurrentRow(row)
    setOpen('view')
  }, [])

  const handleDelete = useCallback((row: ProvinceRecord) => {
    setCurrentRow(row)
    setOpen('delete')
  }, [])

  return (
    <ProvinceContext.Provider
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
    </ProvinceContext.Provider>
  )
}

export function useProvince(): ProvinceContextType {
  const ctx = useContext(ProvinceContext)
  if (!ctx) {
    throw new Error('useProvince must be used within a ProvinceProvider')
  }
  return ctx
}
