/**
 * dialogs.tsx — View DetailRow and Archive ConfirmDialog for Distillers
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { Factory } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { DetailRow } from '@/components/shared/detail-row'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useDistillers } from '@/contexts/scm/distiller.context'
import { useToggleDistillerStatusMutation } from '@/hooks/scm/use-distillers'
import { DistillersActionDialog } from './form'

import type { ReactElement } from 'react'

export function DistillersDialogs(): ReactElement {
  const t = useTranslations('scm.distillers')
  const tTrace = t
  const tCommon = useTranslations('common')
  const { open, setOpen, currentRow, setCurrentRow, refreshData } = useDistillers()
  const { mutateAsync: toggleDistillerStatus, isPending } = useToggleDistillerStatusMutation()

  const handleToggleStatus = async () => {
    if (!currentRow) return
    const targetStatus = !currentRow.active

    try {
      const res = await toggleDistillerStatus({ id: currentRow.id, active: targetStatus })
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

  const isViewOpen = open === 'view' && Boolean(currentRow)
  const isArchiveOpen = open === 'archive' && Boolean(currentRow)

  return (
    <>
      <DistillersActionDialog />
      {/* 1. View Detail Dialog with Standard DetailRow */}
      <Dialog
        open={isViewOpen}
        onOpenChange={(v) => {
          if (!v) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary rounded-md p-1.5">
                <Factory className="size-4" />
              </div>
              <DialogTitle className="text-base font-semibold">{tTrace('dialog.viewTitle')}</DialogTitle>
            </div>
            <DialogDescription className="text-xs">{tTrace('dialog.viewDesc')}</DialogDescription>
          </DialogHeader>

          {currentRow && (
            <div className="space-y-4 pt-2">
              <div className="space-y-1 rounded-md border p-3">
                <DetailRow label={t('details.id')} value={currentRow.ref} mono />
                <DetailRow label={t('details.unitName')} value={currentRow.name} />
                <DetailRow
                  label={t('details.status')}
                  value={
                    <Badge variant={currentRow.active ? 'default' : 'outline'} className="text-[10px]">
                      {currentRow.active ? tTrace('status.operational') : tTrace('status.maintenance')}
                    </Badge>
                  }
                />
                <DetailRow label={t('details.boilerCapacity')} value={`${currentRow.boiler_capacity_kg} Kg Biomassa`} mono />
                <DetailRow label={t('details.extractionMethod')} value={tTrace(`methods.${currentRow.method}`) || currentRow.method} />
                <DetailRow label={t('details.material')} value={currentRow.boiler_material} />
                <DetailRow label={t('details.ownership')} value={tTrace(`ownership.${currentRow.ownership}`) || currentRow.ownership} />
                <DetailRow label={t('details.operator')} value={currentRow.operator_name} />
                {currentRow.phone && <DetailRow label={t('details.operatorContact')} value={currentRow.phone} mono />}
                <DetailRow label={t('details.facilityAddress')} value={`${currentRow.street}, ${currentRow.city}`} />
                {currentRow.partner_latitude && currentRow.partner_longitude && (
                  <DetailRow label={t('details.coordinates')} value={`${currentRow.partner_latitude}, ${currentRow.partner_longitude}`} mono />
                )}
                {currentRow.comment && <DetailRow label={tTrace('fields.comment')} value={currentRow.comment} border={false} />}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 2. Confirm Archive / Restore Dialog */}
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
