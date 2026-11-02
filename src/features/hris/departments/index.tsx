'use client'

import { useState } from 'react'
import { FolderTree, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { useDepartmentsQuery } from '@/hooks/hris/use-departments'

import { DepartmentsActionDialog } from './form'
import { DepartmentsTable } from './table'

import type { DepartmentRecord } from '@/actions/hris/department.action'
import type { ReactElement } from 'react'

export interface DepartmentsFeatureProps {
  initialData?: DepartmentRecord[]
}

export function DepartmentsFeature({ initialData = [] }: DepartmentsFeatureProps): ReactElement {
  const tAdmin = useTranslations('admin.departments')
  const { data = initialData, refetch } = useDepartmentsQuery()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<DepartmentRecord | null>(null)

  const handleCreate = () => {
    setSelectedRow(null)
    setDialogOpen(true)
  }

  const handleEdit = (row: DepartmentRecord) => {
    setSelectedRow(row)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={tAdmin('title')}
        description={tAdmin('subtitle')}
        icon={FolderTree}
        actions={
          <Button onClick={handleCreate} className="cursor-pointer gap-1.5 font-semibold">
            <Plus className="size-4" />
            <span>{tAdmin('actions.add')}</span>
          </Button>
        }
      />

      <DepartmentsTable data={data} onEdit={handleEdit} onRefresh={refetch} />

      <DepartmentsActionDialog open={dialogOpen} onOpenChange={setDialogOpen} currentRow={selectedRow} onSuccess={refetch} />
    </div>
  )
}
