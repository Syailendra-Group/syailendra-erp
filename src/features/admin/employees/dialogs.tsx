'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useEmployees } from '@/contexts/employees-context'

import { toggleEmployeeStatusAction } from './actions'
import { EmployeeForm } from './form'

export function EmployeesDialogs(): React.ReactElement {
  const tAdmin = useTranslations('admin.employees')
  const tCommon = useTranslations('common')
  const { open, setOpen, currentRow, setCurrentRow, departments, refreshData } = useEmployees()
  const [isPending, startTransition] = React.useTransition()

  const handleToggleStatus = () => {
    if (!currentRow) return
    startTransition(async () => {
      const res = await toggleEmployeeStatusAction(currentRow.id, !currentRow.active)
      if (res.success) {
        toast.success(currentRow.active ? tAdmin('messages.archived') : tAdmin('messages.updated'))
        setOpen(null)
        setCurrentRow(null)
        refreshData()
      } else {
        toast.error(res.error || 'Failed to update status')
      }
    })
  }

  return (
    <>
      {/* Create / Edit Dialog Modal */}
      <Dialog
        open={open === 'add' || open === 'edit'}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">{open === 'edit' ? tAdmin('actions.edit') : tAdmin('actions.add')}</DialogTitle>
          </DialogHeader>
          <EmployeeForm
            initialData={open === 'edit' ? currentRow : null}
            departments={departments}
            onSuccess={() => {
              setOpen(null)
              setCurrentRow(null)
              refreshData()
            }}
            onCancel={() => {
              setOpen(null)
              setCurrentRow(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Archive / Reactivate Confirmation Dialog */}
      <Dialog
        open={open === 'archive'}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">{currentRow?.active ? 'Konfirmasi Arsip Karyawan' : 'Pulihkan Karyawan'}</DialogTitle>
          </DialogHeader>
          <div className="text-muted-foreground py-2 text-xs">
            Apakah Anda yakin ingin {currentRow?.active ? 'mengarsipkan' : 'mengaktifkan kembali'} karyawan{' '}
            <span className="text-foreground font-bold">{currentRow?.name}</span>?
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setOpen(null)
                setCurrentRow(null)
              }}
              disabled={isPending}
            >
              {tCommon('actions.cancel')}
            </Button>
            <Button
              type="button"
              variant={currentRow?.active ? 'destructive' : 'default'}
              size="sm"
              onClick={handleToggleStatus}
              disabled={isPending}
            >
              {currentRow?.active ? 'Arsipkan' : 'Pulihkan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
