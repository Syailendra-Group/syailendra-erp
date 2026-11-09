'use client'

import { useTranslations } from 'next-intl'

import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { useDepartment } from '@/contexts/hris/department.context'
import { useToggleDepartmentStatusMutation } from '@/hooks/hris/use-departments'

import { DepartmentsActionDialog } from './form'

import type { DepartmentRecord } from '@/types/hris/department'
import type { ReactElement } from 'react'

export function DepartmentsDialogs(): ReactElement {
  const tAdmin = useTranslations('admin.departments')
  const tCommon = useTranslations('common')
  const { open, setOpen, currentRow } = useDepartment()
  const { mutateAsync: toggleStatus, isPending: isToggling } = useToggleDepartmentStatusMutation()

  const handleToggle = async (item: DepartmentRecord) => {
    await toggleStatus({ id: item.id, active: !item.active })
    setOpen(null)
  }

  const isActionDialogOpen = open === 'add' || open === 'create' || open === 'edit'
  const isConfirmOpen = open === 'archive' || open === 'restore'

  return (
    <>
      <DepartmentsActionDialog
        open={isActionDialogOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        currentRow={currentRow}
        onSuccess={() => setOpen(null)}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        title={open === 'archive' ? tAdmin('confirm.archiveTitle') : tAdmin('confirm.restoreTitle')}
        desc={
          open === 'archive'
            ? tAdmin('confirm.archiveDesc', { name: currentRow?.name || '' })
            : tAdmin('confirm.restoreDesc', { name: currentRow?.name || '' })
        }
        confirmText={open === 'archive' ? tCommon('actions.archive') : tCommon('actions.restore')}
        destructive={open === 'archive'}
        isLoading={isToggling}
        handleConfirm={() => currentRow && handleToggle(currentRow)}
      />
    </>
  )
}
