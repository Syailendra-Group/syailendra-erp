'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { useVillage } from '@/contexts/others/village.context'
import { useToggleVillageStatusMutation } from '@/hooks/others/use-villages'

import { VillageActionDialog } from './dialogs/village-action-dialog'

import type { VillageRecord } from '@/types/others/village'
import type { ReactElement } from 'react'

export interface VillagesDialogsProps {
  archiveTarget: VillageRecord | null
  onCloseArchive: () => void
}

export function VillagesDialogs({ archiveTarget, onCloseArchive }: VillagesDialogsProps): ReactElement {
  const tCommon = useTranslations('common')
  const { open, setOpen, currentRow } = useVillage()
  const { mutateAsync: toggleStatus, isPending } = useToggleVillageStatusMutation()

  const isFormOpen = open === 'add' || open === 'edit'

  const handleToggle = async () => {
    if (!archiveTarget) return
    const nextStatus = !archiveTarget.active
    try {
      const res = await toggleStatus({ id: archiveTarget.id, active: nextStatus })
      if (res.success) {
        toast.success(nextStatus ? 'Desa berhasil diaktifkan kembali' : 'Desa berhasil diarsipkan')
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
      <VillageActionDialog
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
        title={archiveTarget?.active ? 'Arsipkan Kelurahan / Desa' : 'Aktifkan Kembali Kelurahan / Desa'}
        desc={`Apakah Anda yakin ingin mengubah status operasional untuk ${archiveTarget?.name || ''}?`}
        confirmText={archiveTarget?.active ? tCommon('actions.archive') : tCommon('actions.restore')}
        destructive={archiveTarget?.active}
      />
    </>
  )
}
