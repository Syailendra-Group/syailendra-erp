'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { StatusBadge } from '@/components/shared/data-badge'
import { DetailRow } from '@/components/shared/detail-row'
import { useFarmContext } from '@/contexts/scm/farm.context'
import { useCommodityOptions } from '@/hooks/scm/use-commodities'
import { useDeleteFarm } from '@/hooks/scm/use-farms'

export function FarmDialogs() {
  const t = useTranslations('scm.farms')
  const tCommon = useTranslations('common')
  const { open, setOpen, selectedFarm, setSelectedFarm } = useFarmContext()
  const deleteMutation = useDeleteFarm()
  const { data: commodityOptions = [] } = useCommodityOptions()

  const isViewOpen = open === 'view' && Boolean(selectedFarm)
  const isDeleteOpen = open === 'delete' && Boolean(selectedFarm)

  const commodityNames = selectedFarm
    ? selectedFarm.cropIds
        .map((id) => commodityOptions.find((commodity) => commodity.id === id)?.name)
        .filter((name): name is string => Boolean(name))
    : []

  const handleDelete = async () => {
    if (!selectedFarm) return

    const result = await deleteMutation.mutateAsync(selectedFarm.id)

    if (result.success) {
      toast.success(t('toast.deleteSuccess'))
      setOpen(null)
      setSelectedFarm(null)
      return
    }

    toast.error(result.error === 'RELATIONAL_INTEGRITY_ERROR' ? t('toast.deleteErrorRelational') : result.error || t('toast.deleteError'))
  }

  return (
    <>
      <ActionDialog
        open={isViewOpen}
        onOpenChange={(value) => {
          if (!value) {
            setOpen(null)
            setSelectedFarm(null)
          }
        }}
        isView
        title={t('dialog.viewTitle')}
        description={t('dialog.viewDescription')}
        maxWidth="sm:max-w-lg"
      >
        {selectedFarm && (
          <div className="space-y-1 rounded-md border p-3">
            <DetailRow label={t('table.columns.code')} value={selectedFarm.code} mono />
            <DetailRow label={t('table.columns.name')} value={selectedFarm.name} />
            <DetailRow label={t('form.fields.partner')} value={selectedFarm.partnerName || '—'} />
            <DetailRow label={t('table.columns.commodities')} value={commodityNames.length > 0 ? commodityNames.join(', ') : '—'} />
            <DetailRow label={t('form.fields.farmingSystem')} value={t(`farmingSystems.${selectedFarm.farmingSystem}`)} />
            <DetailRow
              label={t('table.columns.region')}
              value={
                [selectedFarm.subdistrictName, selectedFarm.districtName, selectedFarm.cityName, selectedFarm.stateName].filter(Boolean).join(', ') ||
                '—'
              }
            />
            <DetailRow
              label={t('form.fields.areaHa')}
              value={selectedFarm.areaHa !== null ? `${selectedFarm.areaHa.toLocaleString('id-ID')} Ha` : '—'}
              mono
            />
            <DetailRow
              label={t('form.fields.elevationMdpl')}
              value={selectedFarm.elevationMdpl !== null ? `${selectedFarm.elevationMdpl} mdpl` : '—'}
              mono
            />
            <DetailRow label={t('table.columns.geolocation')} value={selectedFarm.googleMapsUrl || '—'} border={false} />
            <DetailRow
              label={t('table.columns.status')}
              value={
                <StatusBadge variant={selectedFarm.active ? 'success' : 'neutral'}>
                  {selectedFarm.active ? tCommon('status.active') : tCommon('status.inactive')}
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
            setSelectedFarm(null)
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
