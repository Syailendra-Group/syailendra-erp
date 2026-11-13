'use client'

import { Briefcase } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PrimaryAction } from '@/components/button/primary-action'
import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { DepartmentProvider, useDepartment } from '@/contexts/hrm/department.context'

import { DepartmentsDialogs } from './dialogs'
import { DepartmentsTable } from './table'

import type { ReactElement } from 'react'

function DepartmentsContent(): ReactElement {
  const tAdmin = useTranslations('admin.departments')
  const { handleCreate } = useDepartment()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={tAdmin('title')}
        description={tAdmin('subtitle')}
        icon={Briefcase}
        actions={<PrimaryAction onClick={handleCreate} label={tAdmin('actions.add')} />}
      />

      <SectionCard>
        <DepartmentsTable />
      </SectionCard>

      <DepartmentsDialogs />
    </div>
  )
}

export function DepartmentsFeature(): ReactElement {
  return (
    <DepartmentProvider>
      <DepartmentsContent />
    </DepartmentProvider>
  )
}

export * from './table'
export * from './columns'
export * from './dialogs'
export * from './form'
