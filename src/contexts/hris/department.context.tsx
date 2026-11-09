'use client'

import { createContext, useCallback, useContext, useState } from 'react'

import type { DepartmentRecord } from '@/types/hris/department'
import type { ReactElement, ReactNode } from 'react'

export type DepartmentsDialogType = 'add' | 'create' | 'edit' | 'delete' | 'archive' | 'restore' | null

export interface DepartmentsContextType {
  open: DepartmentsDialogType
  setOpen: (type: DepartmentsDialogType) => void
  currentRow: DepartmentRecord | null
  setCurrentRow: (row: DepartmentRecord | null) => void
  refreshData?: () => void
  handleCreate: () => void
  handleEdit: (row: DepartmentRecord) => void
  handleView: (row: DepartmentRecord) => void
  handleDelete: (row: DepartmentRecord) => void
}

const DepartmentsContext = createContext<DepartmentsContextType | null>(null)

export interface DepartmentsProviderProps {
  children: ReactNode
  refreshData?: () => void
}

export function DepartmentsProvider({ children, refreshData }: DepartmentsProviderProps): ReactElement {
  const [open, setOpen] = useState<DepartmentsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<DepartmentRecord | null>(null)

  const handleCreate = useCallback(() => {
    setCurrentRow(null)
    setOpen('create')
  }, [])

  const handleEdit = useCallback((row: DepartmentRecord) => {
    setCurrentRow(row)
    setOpen('edit')
  }, [])

  const handleView = useCallback((row: DepartmentRecord) => {
    setCurrentRow(row)
    setOpen('edit')
  }, [])

  const handleDelete = useCallback((row: DepartmentRecord) => {
    setCurrentRow(row)
    setOpen(row.active ? 'archive' : 'restore')
  }, [])

  return (
    <DepartmentsContext.Provider
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
    </DepartmentsContext.Provider>
  )
}

export function useDepartments(): DepartmentsContextType {
  const ctx = useContext(DepartmentsContext)
  if (!ctx) {
    throw new Error('useDepartments must be used within a DepartmentsProvider')
  }
  return ctx
}

export const DepartmentProvider = DepartmentsProvider
export const useDepartment = useDepartments
