'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { useToggleDistrictStatusMutation } from '@/hooks/others/use-districts'

import type { DistrictRecord } from '@/types/others/district'
import type { ReactElement } from 'react'

export interface DistrictsDialogsProps {
  target: DistrictRecord | null
  onClose: () => void
}

export function DistrictsDialogs({ target, onClose }: DistrictsDialogsProps): ReactElement {
  const tCommon = useTranslations('common')
  const { mutateAsync: toggleStatus, isPending } = useToggleDistrictStatusMutation()

  const handleToggle = async () => {
    if (!target) return
    const nextStatus = !target.active
    try {
      const res = await toggleStatus({ id: target.id, active: nextStatus })
      if (res.success) {
        toast.success(nextStatus ? 'Kecamatan berhasil diaktifkan' : 'Kecamatan berhasil diarsipkan')
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
      title={target?.active ? 'Arsipkan Kecamatan' : 'Aktifkan Kembali Kecamatan'}
      desc={`Apakah Anda yakin ingin mengubah status operasional untuk ${target?.name || ''}?`}
      confirmText={target?.active ? tCommon('actions.archive') : tCommon('actions.restore')}
      destructive={target?.active}
    />
  )
}
