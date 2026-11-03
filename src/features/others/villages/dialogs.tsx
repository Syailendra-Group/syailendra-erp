'use client'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useVillage } from '@/contexts/others/village.context'
import { useToggleVillageStatusMutation } from '@/hooks/others/use-villages'

import { VillageForm } from './form'

import type { ReactElement } from 'react'

export function VillagesDialogs(): ReactElement {
  const { open, setOpen, currentRow } = useVillage()
  const { mutateAsync: toggleStatus, isPending: isToggling } = useToggleVillageStatusMutation()

  const isFormOpen = open === 'create' || open === 'edit'
  const isViewOpen = open === 'view'
  const isArchiveOpen = open === 'delete'

  const handleToggleArchive = async () => {
    if (!currentRow?.id) return
    await toggleStatus({ id: currentRow.id, active: !currentRow.active })
    setOpen(null)
  }

  return (
    <>
      {/* Form ActionDialog */}
      <ActionDialog
        open={isFormOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        formId="village-action-form"
        isEdit={open === 'edit'}
        title={open === 'edit' ? 'Ubah Data Kelurahan / Desa' : 'Registrasi Kelurahan / Desa Baru'}
        description={
          open === 'edit'
            ? 'Perbarui kode pos, nama, atau kecamatan induk kelurahan/desa.'
            : 'Daftarkan kelurahan atau desa baru ke dalam katalog wilayah sistem.'
        }
        maxWidth="sm:max-w-xl"
      >
        <VillageForm currentRow={currentRow} onSuccess={() => setOpen(null)} />
      </ActionDialog>

      {/* View Detail Dialog */}
      <Dialog open={isViewOpen} onOpenChange={(isOpen) => !isOpen && setOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>Rincian Kelurahan / Desa</DialogTitle>
            <DialogDescription className="text-xs">Informasi data wilayah dan kecamatan induk terdaftar.</DialogDescription>
          </DialogHeader>

          {currentRow && (
            <div className="space-y-3 pt-2 text-xs">
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">Nama Desa</span>
                <span className="text-foreground col-span-2 font-semibold">{currentRow.name}</span>
              </div>
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">Nama Alias</span>
                <span className="text-foreground col-span-2">{currentRow.alias || '-'}</span>
              </div>
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">Kode BPS</span>
                <span className="text-foreground col-span-2 font-mono font-bold">{currentRow.code}</span>
              </div>
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">Kecamatan Induk</span>
                <span className="text-foreground col-span-2 font-medium">{currentRow.district_id ? currentRow.district_id[1] : '-'}</span>
              </div>
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">Kode Pos</span>
                <span className="text-foreground col-span-2 font-mono">{currentRow.zip_code || '-'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5">
                <span className="text-muted-foreground font-medium">Deskripsi</span>
                <span className="text-foreground col-span-2 italic">{currentRow.description || '-'}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Archive / Delete Dialog */}
      <ConfirmDialog
        open={isArchiveOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        title={currentRow?.active ? 'Arsipkan Kelurahan / Desa' : 'Pulihkan Kelurahan / Desa'}
        desc={`Apakah Anda yakin ingin ${currentRow?.active ? 'menonaktifkan' : 'mengaktifkan'} status wilayah ${currentRow?.name}?`}
        confirmText={currentRow?.active ? 'Arsipkan' : 'Pulihkan'}
        destructive={currentRow?.active}
        isLoading={isToggling}
        handleConfirm={handleToggleArchive}
      />
    </>
  )
}
