'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { Briefcase } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
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
        <PageHeader title={tAdmin('title')} description={tAdmin('subtitle')} icon={Briefcase} actions={<EmployeesPrimaryButtons />} />

        <EmployeesTable data={employees} />

        <EmployeesDialogs />
      </div>
    </EmployeesProvider>
  )
}
