'use client'

import { useTranslations } from 'next-intl'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useDistrict } from '@/contexts/others/district.context'
import { useToggleDistrictStatusMutation } from '@/hooks/others/use-districts'

import { DistrictForm } from './form'

import type { ReactElement } from 'react'

export function DistrictsDialogs(): ReactElement {
  const { open, setOpen, currentRow } = useDistrict()
  const t = useTranslations('others.districts')
  const tReg = useTranslations('regional.common')
  const { mutateAsync: toggleStatus, isPending: isToggling } = useToggleDistrictStatusMutation()

  const isFormOpen = open === 'create' || open === 'edit'
  const isViewOpen = open === 'view'
  const isArchiveOpen = open === 'delete'

  const handleToggleArchive = async () => {
    if (!currentRow?.id) return
    await toggleStatus({ id: currentRow.id, active: !currentRow.active })
    setOpen(null)
  }

  return (
    <>
      {/* Form ActionDialog */}
      <ActionDialog
        open={isFormOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        formId="district-action-form"
        isEdit={open === 'edit'}
        title={open === 'edit' ? t('dialog.editTitle') : t('dialog.addTitle')}
        description={open === 'edit' ? t('dialog.editDesc') : t('dialog.addDesc')}
        maxWidth="sm:max-w-xl"
      >
        <DistrictForm currentRow={currentRow} onSuccess={() => setOpen(null)} />
      </ActionDialog>

      {/* View Detail Dialog */}
      <Dialog open={isViewOpen} onOpenChange={(isOpen) => !isOpen && setOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>{t('dialog.viewTitle')}</DialogTitle>
            <DialogDescription className="text-xs">{t('dialog.viewDesc')}</DialogDescription>
          </DialogHeader>

          {currentRow && (
            <div className="space-y-3 pt-2 text-xs">
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">{t('table.name')}</span>
                <span className="text-foreground col-span-2 font-semibold">{currentRow.name}</span>
              </div>
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">{tReg('fields.alias')}</span>
                <span className="text-foreground col-span-2">{currentRow.alias || '-'}</span>
              </div>
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">{t('table.code')}</span>
                <span className="text-foreground col-span-2 font-mono font-bold">{currentRow.code}</span>
              </div>
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">{t('table.regency')}</span>
                <span className="text-foreground col-span-2 font-medium">{currentRow.city_id ? currentRow.city_id[1] : '-'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5">
                <span className="text-muted-foreground font-medium">{tReg('fields.description')}</span>
                <span className="text-foreground col-span-2 italic">{currentRow.description || '-'}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Archive / Delete Dialog */}
      <ConfirmDialog
        open={isArchiveOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        title={currentRow?.active ? 'Arsipkan Kecamatan' : 'Pulihkan Kecamatan'}
        desc={`Apakah Anda yakin ingin ${currentRow?.active ? 'menonaktifkan' : 'mengaktifkan'} status wilayah ${currentRow?.name}?`}
        confirmText={currentRow?.active ? 'Arsipkan' : 'Pulihkan'}
        destructive={currentRow?.active}
        isLoading={isToggling}
        handleConfirm={handleToggleArchive}
      />
    </>
  )
}
