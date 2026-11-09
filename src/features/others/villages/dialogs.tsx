'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { DetailRow } from '@/components/shared/detail-row'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useVillage } from '@/contexts/others/village.context'
import { useDeleteVillageMutation } from '@/hooks/others/use-villages'

import { VillageForm } from './form/index'

import type { ReactElement } from 'react'

export function VillagesDialogs(): ReactElement {
  const { open, setOpen, currentRow } = useVillage()
  const t = useTranslations('others.villages')
  const tReg = useTranslations('regional.common')
  const tCommon = useTranslations('common')
  const [canSubmit, setCanSubmit] = useState(true)
  const { mutateAsync: deleteVillage, isPending: isDeleting } = useDeleteVillageMutation()

  const isFormOpen = open === 'create' || open === 'edit'
  const isViewOpen = open === 'view'
  const isDeleteOpen = open === 'delete'

  const handleDelete = async () => {
    if (!currentRow?.id) return
    try {
      const res = await deleteVillage(currentRow.id)
      if (res.success) {
        toast.success(tCommon('deleteDialog.success'))
        setOpen(null)
      } else {
        toast.error(res.error || tCommon('deleteDialog.inUseError'))
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tCommon('status.error'))
    }
  }

  return (
    <>
      <ActionDialog
        open={isFormOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        formId="village-action-form"
        isEdit={open === 'edit'}
        submitDisabled={!canSubmit}
        title={open === 'edit' ? t('dialog.editTitle') : t('dialog.addTitle')}
        description={open === 'edit' ? t('dialog.editDesc') : t('dialog.addDesc')}
        maxWidth="sm:max-w-xl"
      >
        <VillageForm currentRow={currentRow} onSuccess={() => setOpen(null)} onValidationChange={setCanSubmit} />
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
              <DetailRow label={t('table.district')} value={currentRow.district_id ? currentRow.district_id[1] : '-'} />
              <DetailRow label={t('table.zipCode')} value={currentRow.zip_code || '-'} mono />
              {currentRow.city_id && <DetailRow label={t('table.city')} value={currentRow.city_id[1]} />}
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
