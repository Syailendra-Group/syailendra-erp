'use client'

import { Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PrimaryAction } from '@/components/button/primary-action'
import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { EmployeesProvider, useEmployees } from '@/contexts/sbi/hrm/employee.context'

import { EmployeesDialogs } from './dialogs'
import { EmployeesTable } from './table'

import type { ReactElement } from 'react'

function EmployeesContent(): ReactElement {
  const tAdmin = useTranslations('admin.employees')
  const { handleCreate } = useEmployees()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={tAdmin('title')}
        description={tAdmin('subtitle')}
        icon={Users}
        actions={<PrimaryAction onClick={handleCreate} label={tAdmin('actions.add')} />}
      />
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
