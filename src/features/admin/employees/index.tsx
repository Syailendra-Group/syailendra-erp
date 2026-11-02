'use client'

import { Briefcase } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { EmployeesProvider } from '@/contexts/hris/employee.context'
import { useEmployeesQuery } from '@/hooks/hris/use-employees'

import { EmployeesDialogs } from './dialogs'
import { EmployeesPrimaryButtons } from './primary-buttons'
import { EmployeesTable } from './table'

import type { ReactElement } from 'react'

export function EmployeesFeature(): ReactElement {
  const tAdmin = useTranslations('admin.employees')
  const { data, refetch } = useEmployeesQuery()
  const employees = data?.employees || []
  const departments = data?.departments || []

  return (
    <EmployeesProvider refreshData={refetch} initialDepartments={departments}>
      <div className="space-y-6">
        <PageHeader title={tAdmin('title')} description={tAdmin('subtitle')} icon={Briefcase} actions={<EmployeesPrimaryButtons />} />

        <EmployeesTable data={employees} />

        <EmployeesDialogs />
      </div>
    </EmployeesProvider>
  )
}
