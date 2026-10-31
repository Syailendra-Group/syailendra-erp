'use client'

import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/confirm-dialog'

import { toggleFarmerStatusAction } from '../actions'
import { useFarmers } from '../context'

import type { ReactElement } from 'react'

export function FarmersDialogs(): ReactElement {
  const tTrace = useTranslations('traceability.farmers')
  const tCommon = useTranslations('common')
  const { open, setOpen, currentRow, setCurrentRow, refreshData } = useFarmers()
  const [isPending, startTransition] = useTransition()

  const handleToggleStatus = () => {
    if (!currentRow) return
    const targetStatus = !currentRow.active

    startTransition(async () => {
      const res = await toggleFarmerStatusAction(currentRow.id, targetStatus)
      if (res.success) {
        toast.success(targetStatus ? tTrace('messages.restored') : tTrace('messages.archived'))
        refreshData()
        setOpen(null)
        setCurrentRow(null)
      } else {
        toast.error(res.error || (targetStatus ? tTrace('messages.restoreFailed') : tTrace('messages.archiveFailed')))
      }
    })
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
