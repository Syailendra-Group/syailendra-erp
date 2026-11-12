'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { LocationMapCard } from '@/components/map/location-map-card'
import { DetailRow } from '@/components/shared/detail-row'
import { CopyableText } from '@/components/text'
import { useRegency } from '@/contexts/sbi/others/regency.context'
import { useDeleteRegencyMutation } from '@/hooks/sbi/others/use-regencies'

import { RegencyForm } from './form/index'

import type { ReactElement } from 'react'

export function RegenciesDialogs(): ReactElement {
  const { open, setOpen, currentRow } = useRegency()
  const t = useTranslations('others.regencies')
  const tReg = useTranslations('regional.common')
  const tCommon = useTranslations('common')
  const [canSubmit, setCanSubmit] = useState(true)
  const { mutateAsync: deleteRegency, isPending: isDeleting } = useDeleteRegencyMutation()

  const isFormOpen = open === 'create' || open === 'edit'
  const isViewOpen = open === 'view'
  const isDeleteOpen = open === 'delete'

  const handleDelete = async () => {
    if (!currentRow?.id) return
    try {
      const res = await deleteRegency(currentRow.id)
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
        formId="regency-action-form"
        isEdit={open === 'edit'}
        submitDisabled={!canSubmit}
        title={open === 'edit' ? t('dialog.editTitle') : t('dialog.addTitle')}
        description={open === 'edit' ? t('dialog.editDesc') : t('dialog.addDesc')}
        maxWidth="sm:max-w-3xl"
      >
        <RegencyForm currentRow={currentRow} onSuccess={() => setOpen(null)} onValidationChange={setCanSubmit} />
      </ActionDialog>

      <ActionDialog
        open={isViewOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        isView={true}
        title={t('dialog.viewTitle')}
        description={t('dialog.viewDesc')}
        maxWidth="sm:max-w-3xl"
      >
        {currentRow && (
          <div className="grid grid-cols-1 items-start gap-5 pt-1 lg:grid-cols-2">
            <div className="space-y-2 rounded-md border p-3.5 text-xs">
              <DetailRow label={t('table.name')} value={currentRow.name} valueClassName="font-semibold" />
              <DetailRow label={tReg('fields.alias')} value={currentRow.alias || '-'} />
              <DetailRow label={t('table.code')}>{currentRow.code ? <CopyableText text={currentRow.code} /> : '-'}</DetailRow>
              <DetailRow label={t('table.province')} value={currentRow.state_id ? currentRow.state_id[1] : '-'} />
              {currentRow.country_id && <DetailRow label={tReg('fields.country')} value={currentRow.country_id[1]} />}
              <DetailRow label={tReg('fields.description')} value={currentRow.description || '-'} border={false} />
            </div>

            <LocationMapCard
              latitude={currentRow.latitude}
              longitude={currentRow.longitude}
              title={tReg('coordinates')}
              markerLabel={currentRow.name}
              zoom={11}
              height="h-60"
            />
          </div>
        )}
      </ActionDialog>

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
