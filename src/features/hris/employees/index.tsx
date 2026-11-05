'use client'

import { Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { EmployeesProvider } from '@/contexts/hris/employee.context'

import { EmployeesDialogs } from './dialogs'
import { EmployeesPrimaryButtons } from './primary-buttons'
import { EmployeesTable } from './table'

import type { ReactElement } from 'react'

function EmployeesContent(): ReactElement {
  const tAdmin = useTranslations('admin.employees')

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={tAdmin('title')} description={tAdmin('subtitle')} icon={Users} actions={<EmployeesPrimaryButtons />} />
      <SectionCard>
        <EmployeesTable />
      </SectionCard>
      <EmployeesDialogs />
    </div>
  )
}

export function EmployeesFeature(): ReactElement {
  return (
    <EmployeesProvider>
      <EmployeesContent />
    </EmployeesProvider>
  )
}
