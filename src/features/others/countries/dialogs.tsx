'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { LocationMapCard } from '@/components/map/location-map-card'
import { DetailRow } from '@/components/shared/detail-row'
import { CopyableText } from '@/components/text'
import { useCountry } from '@/contexts/others/country.context'
import { useDeleteCountryMutation } from '@/hooks/others/use-countries'

import { CountryForm } from './form'

import type { ReactElement } from 'react'

export function CountriesDialogs(): ReactElement {
  const { open, setOpen, currentRow } = useCountry()
  const t = useTranslations('others.countries')
  const tReg = useTranslations('regional.common')
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
      toast.error(err instanceof Error ? err.message : tCommon('status.error'))
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
        maxWidth="sm:max-w-3xl"
      >
        <CountryForm currentRow={currentRow} onSuccess={() => setOpen(null)} />
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
              <DetailRow label={t('table.code')}>{currentRow.code ? <CopyableText text={currentRow.code} /> : '-'}</DetailRow>
              <DetailRow label={t('table.phoneCode')} border={false}>
                {currentRow.phone_code ? <CopyableText text={`+${currentRow.phone_code}`} /> : '-'}
              </DetailRow>
            </div>

            <LocationMapCard
              latitude={currentRow.latitude}
              longitude={currentRow.longitude}
              title={tReg('coordinates')}
              markerLabel={currentRow.name}
              zoom={5}
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
