'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCountry } from '@/contexts/others/country.context'
import { useDeleteCountryMutation } from '@/hooks/others/use-countries'

import { CountryForm } from './form'

import type { ReactElement } from 'react'

export function CountriesDialogs(): ReactElement {
  const { open, setOpen, currentRow } = useCountry()
  const t = useTranslations('others.countries')
  const tReg = useTranslations('regional.common')
  const { mutateAsync: deleteCountry, isPending: isDeleting } = useDeleteCountryMutation()

  const isFormOpen = open === 'create' || open === 'edit'
  const isViewOpen = open === 'view'
  const isDeleteOpen = open === 'delete'

  const handleDelete = async () => {
    if (!currentRow?.id) return
    try {
      const res = await deleteCountry(currentRow.id)
      if (res.success) {
        toast.success('Negara berhasil dihapus')
        setOpen(null)
      } else {
        toast.error(res.error || 'Gagal menghapus negara')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus negara')
    }
  }

  return (
    <>
      {/* Form ActionDialog */}
      <ActionDialog
        open={isFormOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        formId="country-action-form"
        isEdit={open === 'edit'}
        title={open === 'edit' ? t('dialog.editTitle') : t('dialog.addTitle')}
        description={open === 'edit' ? t('dialog.editDesc') : t('dialog.addDesc')}
        maxWidth="sm:max-w-xl"
      >
        <CountryForm currentRow={currentRow} onSuccess={() => setOpen(null)} />
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
                <span className="text-muted-foreground font-medium">{t('table.code')}</span>
                <span className="text-foreground col-span-2 font-mono font-bold">{currentRow.code}</span>
              </div>
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">{t('table.phoneCode')}</span>
                <span className="text-foreground col-span-2 font-mono">{currentRow.phone_code ? `+${currentRow.phone_code}` : '-'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5">
                <span className="text-muted-foreground font-medium">{tReg('fields.description')}</span>
                <span className="text-foreground col-span-2 italic">{currentRow.description || '-'}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        title={t('dialog.deleteTitle')}
        desc={`Apakah Anda yakin ingin menghapus data negara ${currentRow?.name}? Tindakan ini bersifat permanen di Odoo.`}
        confirmText={t('dialog.deleteConfirm')}
        destructive={true}
        isLoading={isDeleting}
        handleConfirm={handleDelete}
      />
    </>
  )
}
