'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { useRegency } from '@/contexts/others/regency.context'
import { useToggleRegencyStatusMutation } from '@/hooks/others/use-regencies'

import { RegencyActionDialog } from './dialogs/regency-action-dialog'

import type { RegencyRecord } from '@/types/others/regency'
import type { ReactElement } from 'react'

export interface RegenciesDialogsProps {
  archiveTarget: RegencyRecord | null
  onCloseArchive: () => void
}

export function RegenciesDialogs({ archiveTarget, onCloseArchive }: RegenciesDialogsProps): ReactElement {
  const tCommon = useTranslations('common')
  const { open, setOpen, currentRow } = useRegency()
  const { mutateAsync: toggleStatus, isPending } = useToggleRegencyStatusMutation()

  const isFormOpen = open === 'add' || open === 'edit'

  const handleToggle = async () => {
    if (!archiveTarget) return
    const nextStatus = !archiveTarget.active
    try {
      const res = await toggleStatus({ id: archiveTarget.id, active: nextStatus })
      if (res.success) {
        toast.success(nextStatus ? 'Kabupaten berhasil diaktifkan kembali' : 'Kabupaten berhasil diarsipkan')
        onCloseArchive()
      } else {
        toast.error(res.error || 'Gagal mengubah status')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengubah status')
    }
  }

  return (
    <>
      <RegencyActionDialog
        open={isFormOpen}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
        currentRow={currentRow}
      />

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onOpenChange={(v) => {
          if (!v) onCloseArchive()
        }}
        handleConfirm={handleToggle}
        isLoading={isPending}
        title={archiveTarget?.active ? 'Arsipkan Kabupaten' : 'Aktifkan Kembali Kabupaten'}
        desc={`Apakah Anda yakin ingin mengubah status operasional untuk ${archiveTarget?.name || ''}?`}
        confirmText={archiveTarget?.active ? tCommon('actions.archive') : tCommon('actions.restore')}
        destructive={archiveTarget?.active}
      />
    </>
  )
}
