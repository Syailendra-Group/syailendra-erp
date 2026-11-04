'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { DetailRow } from '@/components/shared/detail-row'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useProvince } from '@/contexts/others/province.context'
import { useDeleteProvinceMutation } from '@/hooks/others/use-provinces'

import { ProvinceForm } from './form'

import type { ReactElement } from 'react'

export function ProvincesDialogs(): ReactElement {
  const { open, setOpen, currentRow } = useProvince()
  const t = useTranslations('others.provinces')
  const tReg = useTranslations('regional.common')
  const tCommon = useTranslations('common')
  const { mutateAsync: deleteProvince, isPending: isDeleting } = useDeleteProvinceMutation()

  const isFormOpen = open === 'create' || open === 'edit'
  const isViewOpen = open === 'view'
  const isDeleteOpen = open === 'delete'

  const handleDelete = async () => {
    if (!currentRow?.id) return
    try {
      const res = await deleteProvince(currentRow.id)
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
        formId="province-action-form"
        isEdit={open === 'edit'}
        title={open === 'edit' ? t('dialog.editTitle') : t('dialog.addTitle')}
        description={open === 'edit' ? t('dialog.editDesc') : t('dialog.addDesc')}
        maxWidth="sm:max-w-xl"
      >
        <ProvinceForm currentRow={currentRow} onSuccess={() => setOpen(null)} />
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
              <DetailRow label={t('table.country')} value={currentRow.country_id ? currentRow.country_id[1] : '-'} />
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
