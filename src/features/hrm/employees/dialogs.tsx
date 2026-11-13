'use client'

import { ShieldCheck, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { DetailRow } from '@/components/shared/detail-row'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useEmployees } from '@/contexts/hrm/employee.context'
import { useToggleEmployeeStatusMutation } from '@/hooks/hrm/use-employees'

import { EmployeesActionDialog } from './form'

import type { ReactElement } from 'react'

export function EmployeesDialogs(): ReactElement {
  const tAdmin = useTranslations('admin.employees')
  const tCommon = useTranslations('common')
  const { open, setOpen, currentRow, setCurrentRow, departments, refreshData } = useEmployees()
  const { mutateAsync: toggleEmployeeStatus, isPending } = useToggleEmployeeStatusMutation()

  const handleToggleStatus = async () => {
    if (!currentRow) return
    try {
      const res = await toggleEmployeeStatus({ id: currentRow.id, active: !currentRow.active })
      if (res.success) {
        toast.success(currentRow.active ? tAdmin('messages.archived') : tAdmin('messages.updated'))
        setOpen(null)
        setCurrentRow(null)
        refreshData?.()
      } else {
        toast.error(res.error || tCommon('status.error'))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : tCommon('status.error')
      toast.error(msg)
    }
  }

  return (
    <>
      {/* View Detail Dialog */}
      <Dialog
        open={open === 'view'}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <User className="text-primary h-4 w-4" />
              <span>{tAdmin('detail.title')}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">{tAdmin('detail.subtitle')}</DialogDescription>
          </DialogHeader>

          {currentRow && (
            <div className="space-y-4 pt-2">
              <div className="space-y-1 rounded-md border p-3">
                <DetailRow label={tAdmin('fields.name')} value={currentRow.name} />
                <DetailRow label={tAdmin('fields.job_title')} value={currentRow.job_title || tAdmin('detail.defaultJob')} />
                <DetailRow
                  label={tAdmin('detail.department')}
                  value={
                    currentRow.department_id ? (
                      <Badge variant="secondary" className="text-[10px]">
                        {currentRow.department_id[1]}
                      </Badge>
                    ) : (
                      tAdmin('table.defaultDept')
                    )
                  }
                />
                <DetailRow label={tAdmin('detail.workEmail')} value={currentRow.work_email || '-'} mono />
                <DetailRow label={tAdmin('detail.workPhone')} value={currentRow.work_phone || '-'} mono />
                <DetailRow label={tAdmin('detail.odooId')} value={`#${currentRow.id}`} mono />
                <DetailRow
                  label={tCommon('status.title') || 'Status'}
                  value={
                    <Badge variant={currentRow.active ? 'default' : 'secondary'} className="text-[10px]">
                      {currentRow.active ? tCommon('status.active') : tCommon('status.archived')}
                    </Badge>
                  }
                  border={false}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setOpen(null)
                setCurrentRow(null)
              }}
            >
              {tCommon('actions.cancel')}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setOpen('edit')
              }}
              className="gap-1.5"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{tAdmin('detail.editProfile')}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog Form */}
      <EmployeesActionDialog
        open={open === 'add' || open === 'edit'}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
        currentRow={open === 'edit' ? currentRow : null}
        departments={departments}
        onSuccess={() => {
          setOpen(null)
          setCurrentRow(null)
          refreshData?.()
        }}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={open === 'archive'}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
        title={currentRow?.active ? tCommon('confirm.archiveTitle') : tCommon('confirm.restoreTitle')}
        desc={
          currentRow?.active
            ? tCommon('confirm.archiveDesc', { name: currentRow?.name || '' })
            : tCommon('confirm.restoreDesc', { name: currentRow?.name || '' })
        }
        confirmText={currentRow?.active ? tCommon('actions.archive') : tCommon('actions.restore')}
        cancelBtnText={tCommon('actions.cancel')}
        destructive={currentRow?.active}
        isLoading={isPending}
        handleConfirm={handleToggleStatus}
        className="sm:max-w-sm"
      />
    </>
  )
}
