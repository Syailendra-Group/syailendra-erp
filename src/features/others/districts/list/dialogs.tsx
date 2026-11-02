'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { useDistrict } from '@/contexts/others/district.context'
import { useToggleDistrictStatusMutation } from '@/hooks/others/use-districts'

import { DistrictActionDialog } from './dialogs/district-action-dialog'

import type { DistrictRecord } from '@/types/others/district'
import type { ReactElement } from 'react'

export interface DistrictsDialogsProps {
  archiveTarget: DistrictRecord | null
  onCloseArchive: () => void
}

export function DistrictsDialogs({ archiveTarget, onCloseArchive }: DistrictsDialogsProps): ReactElement {
  const tCommon = useTranslations('common')
  const { open, setOpen, currentRow } = useDistrict()
  const { mutateAsync: toggleStatus, isPending } = useToggleDistrictStatusMutation()

  const isFormOpen = open === 'add' || open === 'edit'

  const handleToggle = async () => {
    if (!archiveTarget) return
    const nextStatus = !archiveTarget.active
    try {
      const res = await toggleStatus({ id: archiveTarget.id, active: nextStatus })
      if (res.success) {
        toast.success(nextStatus ? 'Kecamatan berhasil diaktifkan kembali' : 'Kecamatan berhasil diarsipkan')
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
      <DistrictActionDialog
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
        title={archiveTarget?.active ? 'Arsipkan Kecamatan' : 'Aktifkan Kembali Kecamatan'}
        desc={`Apakah Anda yakin ingin mengubah status operasional untuk ${archiveTarget?.name || ''}?`}
        confirmText={archiveTarget?.active ? tCommon('actions.archive') : tCommon('actions.restore')}
        destructive={archiveTarget?.active}
      />
    </>
  )
}
