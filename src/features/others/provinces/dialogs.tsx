'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { LocationMapCard } from '@/components/map/location-map-card'
import { DetailRow } from '@/components/shared/detail-row'
import { CopyableText } from '@/components/text'
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
      toast.error(err instanceof Error ? err.message : tCommon('status.error'))
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
        maxWidth="sm:max-w-3xl"
      >
        <ProvinceForm currentRow={currentRow} onSuccess={() => setOpen(null)} />
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
              <DetailRow label={t('table.prefix')}>
                {currentRow.prefix ? <CopyableText text={currentRow.prefix} variant="badge" className="text-primary font-semibold" /> : '-'}
              </DetailRow>
              <DetailRow label={tReg('fields.alias')} value={currentRow.alias || '-'} />
              <DetailRow label={t('table.code')}>{currentRow.code ? <CopyableText text={currentRow.code} /> : '-'}</DetailRow>
              <DetailRow label={t('table.country')} value={currentRow.country_id ? currentRow.country_id[1] : '-'} />
              <DetailRow label={tReg('fields.description')} value={currentRow.description || '-'} border={false} />
            </div>

            <LocationMapCard
              latitude={currentRow.latitude}
              longitude={currentRow.longitude}
              title={tReg('coordinates')}
              markerLabel={currentRow.name}
              zoom={8}
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
