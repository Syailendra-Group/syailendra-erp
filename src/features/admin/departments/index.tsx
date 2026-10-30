'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { FolderTree, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'

import { getDepartmentsAction } from './actions'
import { DepartmentsActionDialog } from './form'
import { DepartmentsTable } from './table'

import type { ReactElement } from 'react'
import type { DepartmentRecord } from './actions'

export interface DepartmentsFeatureProps {
  initialData?: DepartmentRecord[]
}

export function DepartmentsFeature({ initialData = [] }: DepartmentsFeatureProps): ReactElement {
  const tAdmin = useTranslations('admin.departments')
  const [data, setData] = useState<DepartmentRecord[]>(initialData)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<DepartmentRecord | null>(null)
  const [, startTransition] = useTransition()

  const refreshData = useCallback(() => {
    startTransition(async () => {
      const res = await getDepartmentsAction()
      setData(res.departments)
    })
  }, [])

  useEffect(() => {
    if (initialData.length === 0) {
      refreshData()
    }
  }, [initialData.length, refreshData])

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="bg-primary/10 text-primary rounded-lg p-2">
            <FolderTree className="size-4 sm:size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{tAdmin('title')}</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">{tAdmin('subtitle')}</p>
          </div>
        </div>

        <Button size="sm" onClick={handleCreate} className="cursor-pointer gap-1.5 text-xs font-semibold">
          <Plus className="size-3.5" />
          <span>{tAdmin('actions.add')}</span>
        </Button>
      </div>

      <DepartmentsTable data={data} onEdit={handleEdit} onRefresh={refreshData} />

      <DepartmentsActionDialog open={dialogOpen} onOpenChange={setDialogOpen} currentRow={selectedRow} onSuccess={refreshData} />
    </div>
  )
}
