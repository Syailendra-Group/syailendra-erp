'use client'

import { Building, Hash, Mail, Phone, ShieldCheck, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useEmployees } from '@/contexts/hris/employee.context'
import { useToggleEmployeeStatusMutation } from '@/hooks/hris/use-employees'

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
        refreshData()
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
      {/* 1. View Detail Dialog Modal */}
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
            <div className="space-y-3 py-2 text-xs">
              <div className="bg-muted/40 flex items-center justify-between rounded-lg p-3">
                <div>
                  <div className="text-foreground text-sm font-semibold">{currentRow.name}</div>
                  <div className="text-muted-foreground text-xs">{currentRow.job_title || tAdmin('detail.defaultJob')}</div>
                </div>
                <Badge variant={currentRow.active ? 'default' : 'secondary'} className="text-[10px]">
                  {currentRow.active ? tCommon('status.active') : tCommon('status.archived')}
                </Badge>
              </div>

              <div className="border-border/60 space-y-2 rounded-lg border p-3">
                <div className="text-muted-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building className="text-primary h-3.5 w-3.5" /> {tAdmin('detail.department')}
                  </span>
                  <span className="text-foreground font-medium">
                    {currentRow.department_id ? currentRow.department_id[1] : tAdmin('table.defaultDept')}
                  </span>
                </div>
                <Separator />
                <div className="text-muted-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="text-primary h-3.5 w-3.5" /> {tAdmin('detail.workEmail')}
                  </span>
                  <span className="text-foreground font-medium">{currentRow.work_email || '-'}</span>
                </div>
                <Separator />
                <div className="text-muted-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="text-primary h-3.5 w-3.5" /> {tAdmin('detail.workPhone')}
                  </span>
                  <span className="text-foreground font-medium">{currentRow.work_phone || '-'}</span>
                </div>
                <Separator />
                <div className="text-muted-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Hash className="text-primary h-3.5 w-3.5" /> {tAdmin('detail.odooId')}
                  </span>
                  <span className="text-foreground font-mono text-xs font-semibold">#{currentRow.id}</span>
                </div>
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

      {/* 2. Action Dialog (Create / Edit) directly defined in form.tsx */}
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
          refreshData()
        }}
      />

      {/* 3. Archive / Reactivate Confirmation Dialog */}
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
