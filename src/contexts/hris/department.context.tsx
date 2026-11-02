'use client'

import { createContext, useContext, useState } from 'react'

import type { DepartmentRecord } from '@/types/hris/department'
import type { ReactElement, ReactNode } from 'react'

export type DepartmentDialogType = 'add' | 'edit' | 'archive' | 'view' | null

export interface DepartmentContextType {
  open: DepartmentDialogType
  setOpen: (type: DepartmentDialogType) => void
  currentRow: DepartmentRecord | null
  setCurrentRow: (row: DepartmentRecord | null) => void
  refreshData?: () => void
}

const DepartmentContext = createContext<DepartmentContextType | null>(null)

export interface DepartmentProviderProps {
  children: ReactNode
  refreshData?: () => void
}

export function DepartmentProvider({ children, refreshData }: DepartmentProviderProps): ReactElement {
  const [open, setOpen] = useState<DepartmentDialogType>(null)
  const [currentRow, setCurrentRow] = useState<DepartmentRecord | null>(null)

  return (
    <DepartmentContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        refreshData
      }}
    >
      {children}
    </DepartmentContext.Provider>
  )
}

export function useDepartment(): DepartmentContextType {
  const ctx = useContext(DepartmentContext)
  if (!ctx) {
    throw new Error('useDepartment must be used within a DepartmentProvider')
  }
  return ctx
}
