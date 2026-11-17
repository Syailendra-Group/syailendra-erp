/**
 * dialogs.tsx — View DetailRow, ActionDialog Form, and Archive ConfirmDialog for Distillation Facilities
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { LocationMapCard } from '@/components/map/location-map-card'
import { DetailRow } from '@/components/shared/detail-row'
import { Badge } from '@/components/ui/badge'
import { useDistilleries } from '@/contexts/scm/distillery.context'
import { useToggleDistilleryStatusMutation } from '@/hooks/scm/use-distilleries'

import { DistilleryForm } from './form/index'

import type { ReactElement, ReactNode } from 'react'

function DetailBlock({ title, children }: { title: string; children: ReactNode }): ReactElement {
  return (
    <div className="space-y-1 rounded-md border p-3">
      <p className="text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase">{title}</p>
      {children}
    </div>
  )
}

export function DistilleriesDialogs(): ReactElement {
  const t = useTranslations('scm.distilleries')
  const tTrace = t
  const tCommon = useTranslations('common')
  const { open, setOpen, currentRow, setCurrentRow, refreshData } = useDistilleries()
  const { mutateAsync: toggleDistilleryStatus, isPending } = useToggleDistilleryStatusMutation()
  const [isFormPending, setIsFormPending] = useState(false)

  const handleToggleStatus = async () => {
    if (!currentRow) return
    const targetStatus = !currentRow.active

    try {
      const res = await toggleDistilleryStatus({ id: currentRow.id, active: targetStatus })
      if (res.success) {
        toast.success(targetStatus ? tTrace('messages.restored') : tTrace('messages.archived'))
        setOpen(null)
        setCurrentRow(null)
        refreshData?.()
      } else {
        toast.error(res.error || tCommon('messages.error'))
      }
    } catch {
      toast.error(tCommon('messages.error'))
    }
  }

  const isFormOpen = open === 'add' || open === 'create' || open === 'edit'
  const isViewOpen = open === 'view' && Boolean(currentRow)
  const isArchiveOpen = open === 'archive' && Boolean(currentRow)

  return (
    <>
      {/* Action Dialog Form */}
      <ActionDialog
        open={isFormOpen}
        onOpenChange={(v) => {
          if (!v) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
        formId="distillery-action-form"
        isEdit={open === 'edit'}
        title={open === 'edit' ? tTrace('dialog.editTitle') : tTrace('dialog.addTitle')}
        description={open === 'edit' ? tTrace('dialog.editDesc') : tTrace('dialog.addDesc')}
        isPending={isFormPending}
        maxWidth="sm:max-w-3xl"
      >
        <DistilleryForm
          currentRow={currentRow}
          onSuccess={() => {
            setOpen(null)
            setCurrentRow(null)
            refreshData?.()
          }}
          onPendingChange={setIsFormPending}
        />
      </ActionDialog>

      {/* View Detail Dialog */}
      <ActionDialog
        open={isViewOpen}
        onOpenChange={(v) => {
          if (!v) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
        isView
        title={tTrace('dialog.viewTitle')}
        description={tTrace('dialog.viewDesc')}
        maxWidth="sm:max-w-2xl"
      >
        {currentRow && (
          <div className="space-y-4 pt-2">
            <DetailBlock title={t('details.identity')}>
              <DetailRow label={t('details.code')} value={currentRow.code} mono />
              <DetailRow label={t('details.name')} value={currentRow.name} />
              <DetailRow label={t('details.partner')} value={currentRow.partnerName || '-'} />
              <DetailRow
                label={t('details.status')}
                value={
                  <Badge variant={currentRow.active ? 'default' : 'outline'} className="text-[10px]">
                    {currentRow.active ? tTrace('status.operational') : tTrace('status.maintenance')}
                  </Badge>
                }
              />
            </DetailBlock>

            <DetailBlock title={t('details.technical')}>
              <DetailRow label={t('details.method')} value={tTrace(`methods.${currentRow.distillationMethod}`)} />
              <DetailRow label={t('details.boilerCount')} value={`${currentRow.boilerCount} ${t('details.unit')}`} mono />
              <DetailRow label={t('details.boilerCapacity')} value={currentRow.boilerCapacityKg ? `${currentRow.boilerCapacityKg} Kg` : '-'} mono />
              <DetailRow label={t('details.material')} value={tTrace(`materials.${currentRow.boilerMaterial}`)} />
              <DetailRow label={t('details.fuelType')} value={tTrace(`fuels.${currentRow.fuelType}`)} />
              <DetailRow label={t('details.facilityArea')} value={currentRow.facilityAreaM2 ? `${currentRow.facilityAreaM2} m²` : '-'} mono />
            </DetailBlock>

            <DetailBlock title={t('details.performance')}>
              <DetailRow label={t('details.avgDuration')} value={currentRow.avgDurationHours ? `${currentRow.avgDurationHours} jam` : '-'} mono />
              <DetailRow label={t('details.operatingTemp')} value={currentRow.operatingTempC ? `${currentRow.operatingTempC} °C` : '-'} mono />
              <DetailRow
                label={t('details.operatingPressure')}
                value={currentRow.operatingPressureBar ? `${currentRow.operatingPressureBar} bar` : '-'}
                mono
              />
              <DetailRow label={t('details.avgYield')} value={currentRow.avgYieldPercent ? `${currentRow.avgYieldPercent} %` : '-'} mono />
            </DetailBlock>

            <DetailBlock title={t('details.capacity')}>
              <DetailRow
                label={t('details.monthlyCapacity')}
                value={currentRow.monthlyCapacityKg ? `${currentRow.monthlyCapacityKg} Kg` : '-'}
                mono
              />
              <DetailRow label={t('details.yearlyCapacity')} value={currentRow.yearlyCapacityKg ? `${currentRow.yearlyCapacityKg} Kg` : '-'} mono />
              <DetailRow label={t('details.maxCapacity')} value={currentRow.maxCapacityKg ? `${currentRow.maxCapacityKg} Kg` : '-'} mono />
              <DetailRow
                label={t('details.leadTime')}
                value={currentRow.leadTimeDays ? `${currentRow.leadTimeDays} ${t('details.days')}` : '-'}
                mono
              />
              <DetailRow label={t('details.moq')} value={currentRow.moqKg ? `${currentRow.moqKg} Kg` : '-'} mono />
            </DetailBlock>

            <DetailBlock title={t('details.location')}>
              <DetailRow label={t('details.province')} value={currentRow.stateName || '-'} />
              <DetailRow label={t('details.regency')} value={currentRow.cityName || '-'} />
              <DetailRow label={t('details.district')} value={currentRow.districtName || '-'} />
              <DetailRow label={t('details.village')} value={currentRow.subdistrictName || '-'} />
              {currentRow.addressDetail && <DetailRow label={t('details.addressDetail')} value={currentRow.addressDetail} />}
              {currentRow.latitude && currentRow.longitude && (
                <DetailRow label={t('details.coordinates')} value={`${currentRow.latitude}, ${currentRow.longitude}`} mono />
              )}
            </DetailBlock>

            {currentRow.latitude && currentRow.longitude && (
              <LocationMapCard
                latitude={currentRow.latitude}
                longitude={currentRow.longitude}
                title={t('details.coordinates')}
                markerLabel={currentRow.name}
                height="h-44"
              />
            )}
          </div>
        )}
      </ActionDialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={isArchiveOpen}
        onOpenChange={(v) => {
          if (!v) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
        handleConfirm={handleToggleStatus}
        isLoading={isPending}
        title={currentRow?.active ? tTrace('confirm.archiveTitle') : tTrace('confirm.restoreTitle')}
        desc={
          currentRow?.active
            ? tTrace('confirm.archiveDesc', { name: currentRow?.name || '' })
            : tTrace('confirm.restoreDesc', { name: currentRow?.name || '' })
        }
        confirmText={currentRow?.active ? tCommon('actions.archive') : tCommon('actions.restore')}
        destructive={currentRow?.active}
      />
    </>
  )
}
