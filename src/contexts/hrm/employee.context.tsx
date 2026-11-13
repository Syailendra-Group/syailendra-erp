'use client'

import { createContext, useCallback, useContext, useState } from 'react'

import type { DepartmentOption, EmployeeRecord } from '@/types/hrm/employee'
import type { ReactElement, ReactNode } from 'react'

export type EmployeesDialogType = 'add' | 'edit' | 'archive' | 'view' | null

export interface EmployeesContextType {
  open: EmployeesDialogType
  setOpen: (type: EmployeesDialogType) => void
  currentRow: EmployeeRecord | null
  setCurrentRow: (row: EmployeeRecord | null) => void
  departments: DepartmentOption[]
  setDepartments: (departments: DepartmentOption[]) => void
  refreshData?: () => void
  handleCreate: () => void
  handleEdit: (row: EmployeeRecord) => void
  handleView: (row: EmployeeRecord) => void
  handleDelete: (row: EmployeeRecord) => void
}

const EmployeesContext = createContext<EmployeesContextType | null>(null)

export interface EmployeesProviderProps {
  children: ReactNode
  initialDepartments?: DepartmentOption[]
  refreshData?: () => void
}

export function EmployeesProvider({ children, initialDepartments = [], refreshData }: EmployeesProviderProps): ReactElement {
  const [open, setOpen] = useState<EmployeesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<EmployeeRecord | null>(null)
  const [departments, setDepartments] = useState<DepartmentOption[]>(initialDepartments)

  const handleCreate = useCallback(() => {
    setCurrentRow(null)
    setOpen('add')
  }, [])

  const handleEdit = useCallback((row: EmployeeRecord) => {
    setCurrentRow(row)
    setOpen('edit')
  }, [])

  const handleView = useCallback((row: EmployeeRecord) => {
    setCurrentRow(row)
    setOpen('view')
  }, [])

  const handleDelete = useCallback((row: EmployeeRecord) => {
    setCurrentRow(row)
    setOpen('archive')
  }, [])

  return (
    <EmployeesContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        departments,
        setDepartments,
        refreshData,
        handleCreate,
        handleEdit,
        handleView,
        handleDelete
      }}
    >
      {children}
    </EmployeesContext.Provider>
  )
}

export function useEmployees(): EmployeesContextType {
  const ctx = useContext(EmployeesContext)
  if (!ctx) {
    throw new Error('useEmployees must be used within a EmployeesProvider')
  }
  return ctx
}
