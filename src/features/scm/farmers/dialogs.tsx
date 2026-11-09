'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { useFarmers } from '@/contexts/scm/farmer.context'
import { useToggleFarmerStatusMutation } from '@/hooks/scm/use-farmers'

import type { ReactElement } from 'react'

export function FarmersDialogs(): ReactElement {
  const t = useTranslations('scm.farmers')
  const tCommon = useTranslations('common')
  const { open, setOpen, currentRow, setCurrentRow, refreshData } = useFarmers()
  const { mutateAsync: toggleStatus, isPending } = useToggleFarmerStatusMutation()

  const handleToggleStatus = async () => {
    if (!currentRow) return
    const targetStatus = !currentRow.active

    try {
      const res = await toggleStatus({ id: currentRow.id, active: targetStatus })
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
      handleConfirm={handleToggleStatus}
      isLoading={isPending}
      title={currentRow?.active ? t('confirm.archiveTitle') : t('confirm.restoreTitle')}
      desc={
        currentRow?.active ? t('confirm.archiveDesc', { name: currentRow?.name || '' }) : t('confirm.restoreDesc', { name: currentRow?.name || '' })
      }
      confirmText={currentRow?.active ? tCommon('actions.archive') : tCommon('actions.restore')}
      destructive={currentRow?.active}
    />
  )
}
