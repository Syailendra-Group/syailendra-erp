'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { StatusBadge } from '@/components/shared/data-badge'
import { DetailRow } from '@/components/shared/detail-row'
import { useCommodityContext } from '@/contexts/scm/commodity.context'
import { useDeleteCommodity } from '@/hooks/scm/use-commodities'

import { CommodityForm } from './form'

export function CommodityDialogs() {
  const t = useTranslations('scm.commodities')
  const { open, setOpen, selectedCommodity, setSelectedCommodity } = useCommodityContext()
  const deleteMutation = useDeleteCommodity()
  const [isFormPending, setIsFormPending] = useState(false)

  const isFormOpen = open === 'create' || open === 'edit'
  const isEdit = open === 'edit' && Boolean(selectedCommodity)
  const isViewOpen = open === 'view' && Boolean(selectedCommodity)
  const isDeleteOpen = open === 'delete' && Boolean(selectedCommodity)

  const handleDelete = async () => {
    if (!selectedCommodity) return

    const result = await deleteMutation.mutateAsync(selectedCommodity.id)

    if (result.success) {
      toast.success(t('toast.deleteSuccess'))
      setOpen(null)
      setSelectedCommodity(null)
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
            setSelectedCommodity(null)
          }
        }}
        title={isEdit ? t('form.editTitle') : t('form.createTitle')}
        description={t('form.description')}
        formId="commodity-form"
        isPending={isFormPending}
        isEdit={isEdit}
        maxWidth="sm:max-w-2xl"
      >
        <CommodityForm
          selectedCommodity={selectedCommodity}
          isEdit={isEdit}
          onSuccess={() => {
            setOpen(null)
            setSelectedCommodity(null)
          }}
          onPendingChange={setIsFormPending}
        />
      </ActionDialog>

      <ActionDialog
        open={isViewOpen}
        onOpenChange={(value) => {
          if (!value) {
            setOpen(null)
            setSelectedCommodity(null)
          }
        }}
        isView
        title={t('dialog.viewTitle')}
        description={t('dialog.viewDescription')}
        maxWidth="sm:max-w-md"
      >
        {selectedCommodity && (
          <div className="space-y-1 rounded-md border p-3">
            <DetailRow label={t('table.columns.code')} value={selectedCommodity.code} mono />
            <DetailRow label={t('table.columns.name')} value={selectedCommodity.name} />
            <DetailRow label={t('table.columns.latinName')} value={selectedCommodity.latinName} />
            <DetailRow label={t('table.columns.plantPart')} value={t(`plantParts.${selectedCommodity.plantPart}`)} />
            <DetailRow label={t('table.columns.cultivationStatus')} value={t(`cultivationStatuses.${selectedCommodity.cultivationStatus}`)} />
            <DetailRow label={t('table.columns.harvestSeason')} value={selectedCommodity.harvestSeason || '—'} />
            <DetailRow label={t('table.columns.harvestFrequency')} value={selectedCommodity.harvestFrequency || '—'} />
            <DetailRow
              label={t('form.fields.lifespanMonths')}
              value={selectedCommodity.lifespanMonths !== null ? String(selectedCommodity.lifespanMonths) : '—'}
              mono
            />
            <DetailRow label={t('form.fields.description')} value={selectedCommodity.description || '—'} border={false} />
            <DetailRow
              label={t('table.columns.status')}
              value={
                <StatusBadge variant={selectedCommodity.active ? 'success' : 'neutral'}>
                  {selectedCommodity.active ? t('table.status.active') : t('table.status.inactive')}
                </StatusBadge>
              }
              border={false}
            />
          </div>
        )}
      </ActionDialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={(value) => {
          if (!value) {
            setOpen(null)
            setSelectedCommodity(null)
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
