'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { useFarmers } from '@/contexts/traceability/farmer.context'
import { useToggleFarmerStatusMutation } from '@/hooks/traceability/use-farmers'

import type { ReactElement } from 'react'

export function FarmersDialogs(): ReactElement {
  const tTrace = useTranslations('traceability.farmers')
  const tCommon = useTranslations('common')
  const { open, setOpen, currentRow, setCurrentRow, refreshData } = useFarmers()
  const { mutateAsync: toggleStatus, isPending } = useToggleFarmerStatusMutation()

  const handleToggleStatus = async () => {
    if (!currentRow) return
    const targetStatus = !currentRow.active

    try {
      const res = await toggleStatus({ id: currentRow.id, active: targetStatus })
      if (res.success) {
        toast.success(targetStatus ? tTrace('messages.restored') : tTrace('messages.archived'))
        refreshData()
        setOpen(null)
        setCurrentRow(null)
      } else {
        toast.error(res.error || (targetStatus ? tTrace('messages.restoreFailed') : tTrace('messages.archiveFailed')))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : targetStatus ? tTrace('messages.restoreFailed') : tTrace('messages.archiveFailed')
      toast.error(msg)
    }
  }

  return (
    <ConfirmDialog
      open={open === 'archive'}
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
  )
}
