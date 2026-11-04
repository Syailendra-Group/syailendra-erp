'use client'

import { Briefcase, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { DepartmentProvider, useDepartment } from '@/contexts/hris/department.context'

import { DepartmentsActionDialog } from './form'
import { DepartmentsTable } from './table'

import type { ReactElement } from 'react'

function DepartmentsPrimaryButtons(): ReactElement {
  const { setOpen, setCurrentRow } = useDepartment()
  const tAdmin = useTranslations('admin.departments')

  return (
    <Button
      onClick={() => {
        setCurrentRow(null)
        setOpen('add')
      }}
      className="gap-2 font-semibold"
    >
      <Plus className="size-4" />
      <span>{tAdmin('actions.add')}</span>
    </Button>
  )
}

function DepartmentsContent(): ReactElement {
  const tAdmin = useTranslations('admin.departments')
  const { open, setOpen, currentRow } = useDepartment()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={tAdmin('title')} description={tAdmin('subtitle')} icon={Briefcase} actions={<DepartmentsPrimaryButtons />} />
      <DepartmentsTable />
      <DepartmentsActionDialog
        open={open === 'add' || open === 'edit'}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        currentRow={currentRow}
        onSuccess={() => setOpen(null)}
      />
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
