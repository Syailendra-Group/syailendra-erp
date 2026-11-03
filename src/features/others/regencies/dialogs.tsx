'use client'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useRegency } from '@/contexts/others/regency.context'
import { useToggleRegencyStatusMutation } from '@/hooks/others/use-regencies'

import { RegencyForm } from './form'

import type { ReactElement } from 'react'

export function RegenciesDialogs(): ReactElement {
  const { open, setOpen, currentRow } = useRegency()
  const { mutateAsync: toggleStatus, isPending: isToggling } = useToggleRegencyStatusMutation()

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
        formId="regency-action-form"
        isEdit={open === 'edit'}
        title={open === 'edit' ? 'Ubah Data Kabupaten / Kota' : 'Registrasi Kabupaten / Kota Baru'}
        description={
          open === 'edit' ? 'Perbarui nama, kode BPS, atau provinsi induk kabupaten.' : 'Daftarkan kabupaten atau kota baru ke dalam sistem.'
        }
        maxWidth="sm:max-w-xl"
      >
        <RegencyForm currentRow={currentRow} onSuccess={() => setOpen(null)} />
      </ActionDialog>

      {/* View Detail Dialog */}
      <Dialog open={isViewOpen} onOpenChange={(isOpen) => !isOpen && setOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>Rincian Kabupaten / Kota</DialogTitle>
            <DialogDescription className="text-xs">Informasi data wilayah dan provinsi induk terdaftar.</DialogDescription>
          </DialogHeader>

          {currentRow && (
            <div className="space-y-3 pt-2 text-xs">
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">Nama Kabupaten</span>
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
                <span className="text-muted-foreground font-medium">Provinsi Induk</span>
                <span className="text-foreground col-span-2 font-medium">{currentRow.state_id ? currentRow.state_id[1] : '-'}</span>
              </div>
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">Koordinat GPS</span>
                <span className="text-foreground col-span-2 font-mono">
                  {currentRow.latitude}, {currentRow.longitude}
                </span>
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
        title={currentRow?.active ? 'Arsipkan Kabupaten / Kota' : 'Pulihkan Kabupaten / Kota'}
        desc={`Apakah Anda yakin ingin ${currentRow?.active ? 'menonaktifkan' : 'mengaktifkan'} status wilayah ${currentRow?.name}?`}
        confirmText={currentRow?.active ? 'Arsipkan' : 'Pulihkan'}
        destructive={currentRow?.active}
        isLoading={isToggling}
        handleConfirm={handleToggleArchive}
      />
    </>
  )
}
