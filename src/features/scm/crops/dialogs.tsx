'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { StatusBadge } from '@/components/shared/data-badge'
import { DetailRow } from '@/components/shared/detail-row'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCropContext } from '@/contexts/scm/crop.context'
import { useDeleteCrop } from '@/hooks/scm/use-crops'

import { CropForm } from './form'

export function CropDialogs() {
  const t = useTranslations('scm.crops')
  const { open, setOpen, selectedCrop, setSelectedCrop } = useCropContext()
  const deleteMutation = useDeleteCrop()
  const [isFormPending, setIsFormPending] = useState(false)

  const isFormOpen = open === 'create' || open === 'edit'
  const isEdit = open === 'edit' && Boolean(selectedCrop)
  const isViewOpen = open === 'view' && Boolean(selectedCrop)
  const isDeleteOpen = open === 'delete' && Boolean(selectedCrop)

  const handleDelete = async () => {
    if (!selectedCrop) return

    const result = await deleteMutation.mutateAsync(selectedCrop.id)

    if (result.success) {
      toast.success(t('toast.deleteSuccess'))
      setOpen(null)
      setSelectedCrop(null)
      return
    }

    toast.error(result.error === 'RELATIONAL_INTEGRITY_ERROR' ? t('toast.deleteErrorRelational') : result.error || t('toast.deleteError'))
  }

  return (
    <>
      <ActionDialog
        open={isFormOpen}
        onOpenChange={(value) => {
          if (!value) {
            setOpen(null)
            setSelectedCrop(null)
          }
        }}
        title={isEdit ? t('form.editTitle') : t('form.createTitle')}
        description={t('form.description')}
        formId="crop-form"
        isPending={isFormPending}
        isEdit={isEdit}
        maxWidth="sm:max-w-2xl"
      >
        <CropForm
          selectedCrop={selectedCrop}
          isEdit={isEdit}
          onSuccess={() => {
            setOpen(null)
            setSelectedCrop(null)
          }}
          onPendingChange={setIsFormPending}
        />
      </ActionDialog>

      <Dialog
        open={isViewOpen}
        onOpenChange={(value) => {
          if (!value) {
            setOpen(null)
            setSelectedCrop(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">{t('dialog.viewTitle')}</DialogTitle>
            <DialogDescription className="text-xs">{t('dialog.viewDescription')}</DialogDescription>
          </DialogHeader>

          {selectedCrop && (
            <div className="space-y-1 rounded-md border p-3">
              <DetailRow label={t('table.columns.code')} value={selectedCrop.code} mono />
              <DetailRow label={t('table.columns.name')} value={selectedCrop.name} />
              <DetailRow label={t('table.columns.latinName')} value={selectedCrop.latinName} />
              <DetailRow label={t('table.columns.plantPart')} value={t(`plantParts.${selectedCrop.plantPart}`)} />
              <DetailRow label={t('table.columns.cultivationStatus')} value={t(`cultivationStatuses.${selectedCrop.cultivationStatus}`)} />
              <DetailRow label={t('table.columns.harvestSeason')} value={selectedCrop.harvestSeason || '—'} />
              <DetailRow label={t('table.columns.harvestFrequency')} value={selectedCrop.harvestFrequency || '—'} />
              <DetailRow
                label={t('form.fields.lifespanMonths')}
                value={selectedCrop.lifespanMonths !== null ? String(selectedCrop.lifespanMonths) : '—'}
                mono
              />
              <DetailRow label={t('form.fields.description')} value={selectedCrop.description || '—'} border={false} />
              <DetailRow
                label={t('table.columns.status')}
                value={
                  <StatusBadge variant={selectedCrop.active ? 'success' : 'neutral'}>
                    {selectedCrop.active ? t('table.status.active') : t('table.status.inactive')}
                  </StatusBadge>
                }
                border={false}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={(value) => {
          if (!value) {
            setOpen(null)
            setSelectedCrop(null)
          }
        }}
        title={t('dialog.deleteTitle')}
        desc={t('dialog.deleteDescription')}
        confirmText={t('actions.delete')}
        destructive
        isLoading={deleteMutation.isPending}
        handleConfirm={handleDelete}
      />
    </>
  )
}
