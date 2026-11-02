'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { useToggleRegencyStatusMutation } from '@/hooks/others/use-regencies'

import type { RegencyRecord } from '@/types/others/regency'
import type { ReactElement } from 'react'

export interface RegenciesDialogsProps {
  target: RegencyRecord | null
  onClose: () => void
}

export function RegenciesDialogs({ target, onClose }: RegenciesDialogsProps): ReactElement {
  const tCommon = useTranslations('common')
  const { mutateAsync: toggleStatus, isPending } = useToggleRegencyStatusMutation()

  const handleToggle = async () => {
    if (!target) return
    const nextStatus = !target.active
    try {
      const res = await toggleStatus({ id: target.id, active: nextStatus })
      if (res.success) {
        toast.success(nextStatus ? 'Kabupaten/Kota berhasil diaktifkan kembali' : 'Kabupaten/Kota berhasil diarsipkan')
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
      title={target?.active ? 'Arsipkan Kabupaten / Kota' : 'Aktifkan Kembali Kabupaten / Kota'}
      desc={`Apakah Anda yakin ingin mengubah status operasional untuk ${target?.name || ''}?`}
      confirmText={target?.active ? tCommon('actions.archive') : tCommon('actions.restore')}
      destructive={target?.active}
    />
  )
}
