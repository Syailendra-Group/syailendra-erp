'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { DetailRow } from '@/components/shared/detail-row'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useDistrict } from '@/contexts/others/district.context'
import { useDeleteDistrictMutation } from '@/hooks/others/use-districts'

import { DistrictForm } from './form/index'

import type { ReactElement } from 'react'

export function DistrictsDialogs(): ReactElement {
  const { open, setOpen, currentRow } = useDistrict()
  const t = useTranslations('others.districts')
  const tReg = useTranslations('regional.common')
  const tCommon = useTranslations('common')
  const [canSubmit, setCanSubmit] = useState(true)
  const { mutateAsync: deleteDistrict, isPending: isDeleting } = useDeleteDistrictMutation()

  const isFormOpen = open === 'create' || open === 'edit'
  const isViewOpen = open === 'view'
  const isDeleteOpen = open === 'delete'

  const handleDelete = async () => {
    if (!currentRow?.id) return
    try {
      const res = await deleteDistrict(currentRow.id)
      if (res.success) {
        toast.success(tCommon('deleteDialog.success'))
        setOpen(null)
      } else {
        toast.error(res.error || tCommon('deleteDialog.inUseError'))
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus data')
    }
  }

  return (
    <>
      <ActionDialog
        open={isFormOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        formId="district-action-form"
        isEdit={open === 'edit'}
        submitDisabled={!canSubmit}
        title={open === 'edit' ? t('dialog.editTitle') : t('dialog.addTitle')}
        description={open === 'edit' ? t('dialog.editDesc') : t('dialog.addDesc')}
        maxWidth="sm:max-w-xl"
      >
        <DistrictForm currentRow={currentRow} onSuccess={() => setOpen(null)} onValidationChange={setCanSubmit} />
      </ActionDialog>

      <Dialog open={isViewOpen} onOpenChange={(isOpen) => !isOpen && setOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>{t('dialog.viewTitle')}</DialogTitle>
            <DialogDescription className="text-xs">{t('dialog.viewDesc')}</DialogDescription>
          </DialogHeader>

          {currentRow && (
            <div className="space-y-3 pt-2 text-xs">
              <DetailRow label={t('table.name')} value={currentRow.name} />
              <DetailRow label={tReg('fields.alias')} value={currentRow.alias || '-'} />
              <DetailRow label={t('table.code')} value={currentRow.code || '-'} mono />
              <DetailRow label={t('table.regency')} value={currentRow.city_id ? currentRow.city_id[1] : '-'} />
              {currentRow.country_id && <DetailRow label={tReg('fields.country')} value={currentRow.country_id[1]} />}
              <DetailRow label={tReg('fields.description')} value={currentRow.description || '-'} border={false} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        title={tCommon('deleteDialog.title')}
        desc={tCommon('deleteDialog.desc')}
        confirmText={tCommon('deleteDialog.confirm')}
        cancelBtnText={tCommon('deleteDialog.cancel')}
        destructive
        isLoading={isDeleting}
        handleConfirm={handleDelete}
      />
    </>
  )
}
