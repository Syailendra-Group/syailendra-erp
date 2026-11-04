'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { DetailRow } from '@/components/shared/detail-row'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCountry } from '@/contexts/others/country.context'
import { useDeleteCountryMutation } from '@/hooks/others/use-countries'

import { CountryForm } from './form'

import type { ReactElement } from 'react'

export function CountriesDialogs(): ReactElement {
  const { open, setOpen, currentRow } = useCountry()
  const t = useTranslations('others.countries')
  const tCommon = useTranslations('common')
  const { mutateAsync: deleteCountry, isPending: isDeleting } = useDeleteCountryMutation()

  const isFormOpen = open === 'create' || open === 'edit'
  const isViewOpen = open === 'view'
  const isDeleteOpen = open === 'delete'

  const handleDelete = async () => {
    if (!currentRow?.id) return
    try {
      const res = await deleteCountry(currentRow.id)
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
        formId="country-action-form"
        isEdit={open === 'edit'}
        title={open === 'edit' ? t('dialog.editTitle') : t('dialog.addTitle')}
        description={open === 'edit' ? t('dialog.editDesc') : t('dialog.addDesc')}
        maxWidth="sm:max-w-lg"
      >
        <CountryForm currentRow={currentRow} onSuccess={() => setOpen(null)} />
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
              <DetailRow label={t('table.code')} value={currentRow.code || '-'} mono />
              <DetailRow label={t('table.phoneCode')} value={currentRow.phone_code ? `+${currentRow.phone_code}` : '-'} mono border={false} />
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
