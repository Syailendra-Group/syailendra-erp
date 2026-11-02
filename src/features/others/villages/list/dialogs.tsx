'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { useToggleVillageStatusMutation } from '@/hooks/others/use-villages'

import type { VillageRecord } from '@/types/others/village'
import type { ReactElement } from 'react'

export interface VillagesDialogsProps {
  target: VillageRecord | null
  onClose: () => void
}

export function VillagesDialogs({ target, onClose }: VillagesDialogsProps): ReactElement {
  const tCommon = useTranslations('common')
  const { mutateAsync: toggleStatus, isPending } = useToggleVillageStatusMutation()

  const handleToggle = async () => {
    if (!target) return
    const nextStatus = !target.active
    try {
      const res = await toggleStatus({ id: target.id, active: nextStatus })
      if (res.success) {
        toast.success(nextStatus ? 'Desa berhasil diaktifkan kembali' : 'Desa berhasil diarsipkan')
        onClose()
      } else {
        toast.error(res.error || 'Gagal mengubah status')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengubah status')
    }
  }

  return (
    <ConfirmDialog
      open={Boolean(target)}
      onOpenChange={(v) => {
        if (!v) onClose()
      }}
      handleConfirm={handleToggle}
      isLoading={isPending}
      title={target?.active ? 'Arsipkan Kelurahan / Desa' : 'Aktifkan Kembali Kelurahan / Desa'}
      desc={`Apakah Anda yakin ingin mengubah status operasional untuk ${target?.name || ''}?`}
      confirmText={target?.active ? tCommon('actions.archive') : tCommon('actions.restore')}
      destructive={target?.active}
    />
  )
}
