/**
 * dialogs.tsx — Archive / Restore ConfirmDialog for Distillation Facilities
 * Syailendra Group ERP — SCM Pillar
 */

'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { useDistilleries } from '@/contexts/scm/distillery.context'
import { useToggleDistilleryStatusMutation } from '@/hooks/scm/use-distilleries'

import type { ReactElement } from 'react'

export function DistilleriesDialogs(): ReactElement {
  const t = useTranslations('scm.distilleries')
  const tCommon = useTranslations('common')
  const { open, setOpen, currentRow, setCurrentRow, refreshData } = useDistilleries()
  const { mutateAsync: toggleDistilleryStatus, isPending } = useToggleDistilleryStatusMutation()

  const handleToggleStatus = async () => {
    if (!currentRow) return
    const targetStatus = !currentRow.active

    try {
      const res = await toggleDistilleryStatus({ id: currentRow.id, active: targetStatus })
      if (res.success) {
        toast.success(targetStatus ? t('messages.restored') : t('messages.archived'))
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

  const isArchiveOpen = open === 'archive' && Boolean(currentRow)

  return (
    <ConfirmDialog
      open={isArchiveOpen}
      onOpenChange={(v) => {
        if (!v) {
          setOpen(null)
          setCurrentRow(null)
        }
      }}
      title={currentRow?.active ? t('confirm.archiveTitle') : t('confirm.restoreTitle')}
      desc={currentRow?.active ? t('confirm.archiveDesc', { name: currentRow.name }) : t('confirm.restoreDesc', { name: currentRow?.name ?? '' })}
      confirmText={currentRow?.active ? t('confirm.archive') : t('confirm.restore')}
      cancelBtnText={tCommon('actions.cancel')}
      handleConfirm={handleToggleStatus}
      isLoading={isPending}
      destructive={Boolean(currentRow?.active)}
    />
  )
}
