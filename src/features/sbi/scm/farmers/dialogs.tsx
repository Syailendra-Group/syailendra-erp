'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { useFarmers } from '@/contexts/sbi/scm/farmer.context'
import { useToggleFarmerStatusMutation } from '@/hooks/sbi/scm/use-farmers'

import type { ReactElement } from 'react'

export function FarmersDialogs(): ReactElement {
  const t = useTranslations('scm.farmers')
  const tCommon = useTranslations('common')
  const { open, setOpen, currentRow, setCurrentRow, refreshData } = useFarmers()
  const { mutateAsync: toggleStatus, isPending } = useToggleFarmerStatusMutation()

  const handleDelete = async () => {
    if (!currentRow) return

    try {
      const res = await toggleStatus({ id: currentRow.id, active: false })
      if (res.success) {
        toast.success(t('messages.deleted'))
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

  const isDeleteOpen = open === 'archive' && Boolean(currentRow)

  return (
    <ConfirmDialog
      open={isDeleteOpen}
      onOpenChange={(v) => {
        if (!v) {
          setOpen(null)
          setCurrentRow(null)
        }
      }}
      handleConfirm={handleDelete}
      isLoading={isPending}
      title={t('confirm.deleteTitle')}
      desc={t('confirm.deleteDesc', { name: currentRow?.name || '' })}
      confirmText={tCommon('actions.delete')}
      destructive={true}
    />
  )
}
