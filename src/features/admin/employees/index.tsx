'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

import { EmployeesProvider } from '@/contexts/employees-context'

import { getEmployeesAction } from './actions'
import { EmployeesDialogs } from './dialogs'
import { EmployeesPrimaryButtons } from './primary-buttons'
import { EmployeesTable } from './table'

import type { ReactElement } from 'react'
import type { DepartmentOption, EmployeeRecord } from './actions'

export function EmployeesFeature(): ReactElement {
  const tAdmin = useTranslations('admin.employees')
  const [employees, setEmployees] = useState<EmployeeRecord[]>([])
  const [departments, setDepartments] = useState<DepartmentOption[]>([])
  const [, startTransition] = useTransition()

  const refreshData = useCallback(() => {
    startTransition(async () => {
      const data = await getEmployeesAction()
      setEmployees(data.employees)
      setDepartments(data.departments)
    })
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  return (
    <EmployeesProvider refreshData={refreshData} initialDepartments={departments}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{tAdmin('title')}</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">{tAdmin('subtitle')}</p>
          </div>

          <EmployeesPrimaryButtons />
        </div>

        <EmployeesTable data={employees} />

        <EmployeesDialogs />
      </div>
    </EmployeesProvider>
  )
}
