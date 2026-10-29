'use client'

import { createContext, useContext, useState } from 'react'

import type { DepartmentOption, EmployeeRecord } from '@/features/admin/employees/actions'
import type { ReactElement, ReactNode } from 'react'

export type EmployeesDialogType = 'add' | 'edit' | 'archive' | 'view' | null

export interface EmployeesContextType {
  open: EmployeesDialogType
  setOpen: (type: EmployeesDialogType) => void
  currentRow: EmployeeRecord | null
  setCurrentRow: (row: EmployeeRecord | null) => void
  departments: DepartmentOption[]
  setDepartments: (depts: DepartmentOption[]) => void
  refreshData: () => void
}

const EmployeesContext = createContext<EmployeesContextType | null>(null)

export interface EmployeesProviderProps {
  children: ReactNode
  refreshData: () => void
  initialDepartments?: DepartmentOption[]
}

export function EmployeesProvider({ children, refreshData, initialDepartments = [] }: EmployeesProviderProps): ReactElement {
  const [open, setOpen] = useState<EmployeesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<EmployeeRecord | null>(null)
  const [departments, setDepartments] = useState<DepartmentOption[]>(initialDepartments)

  return (
    <EmployeesContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        departments,
        setDepartments,
        refreshData
      }}
    >
      {children}
    </EmployeesContext.Provider>
  )
}

export function useEmployees(): EmployeesContextType {
  const ctx = useContext(EmployeesContext)
  if (!ctx) {
    throw new Error('useEmployees must be used within an EmployeesProvider')
  }
  return ctx
}
