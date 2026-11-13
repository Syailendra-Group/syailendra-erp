'use client'

import { useTranslations } from 'next-intl'

import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { StatusBadge } from '@/components/shared/data-badge'
import { DetailRow } from '@/components/shared/detail-row'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useDepartment } from '@/contexts/hrm/department.context'
import { useToggleDepartmentStatusMutation } from '@/hooks/hrm/use-departments'

import { DepartmentsActionDialog } from './form'

import type { DepartmentRecord } from '@/types/hrm/department'
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
  const isViewOpen = open === 'view'
  const isConfirmOpen = open === 'archive' || open === 'restore'

  return (
    <>
      <DepartmentsActionDialog
        open={isActionDialogOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        currentRow={currentRow}
        onSuccess={() => setOpen(null)}
      />

      <Dialog open={isViewOpen} onOpenChange={(isOpen) => !isOpen && setOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>{tAdmin('view.title')}</DialogTitle>
            <DialogDescription className="text-xs">{tAdmin('view.description')}</DialogDescription>
          </DialogHeader>

          {currentRow && (
            <div className="space-y-3 pt-2 text-xs">
              <DetailRow label={tAdmin('fields.name')} value={currentRow.name} />
              <DetailRow label={tAdmin('fields.id')} value={String(currentRow.id)} mono />
              <DetailRow
                label={tAdmin('fields.status')}
                value={
                  <StatusBadge variant={currentRow.active ? 'success' : 'warning'}>
                    {currentRow.active ? tCommon('status.active') : tCommon('status.archived')}
                  </StatusBadge>
                }
                border={false}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

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
