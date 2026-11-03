'use client'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useDistrict } from '@/contexts/others/district.context'
import { useToggleDistrictStatusMutation } from '@/hooks/others/use-districts'

import { DistrictForm } from './form'

import type { ReactElement } from 'react'

export function DistrictsDialogs(): ReactElement {
  const { open, setOpen, currentRow } = useDistrict()
  const { mutateAsync: toggleStatus, isPending: isToggling } = useToggleDistrictStatusMutation()

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
        formId="district-action-form"
        isEdit={open === 'edit'}
        title={open === 'edit' ? 'Ubah Data Kecamatan' : 'Registrasi Kecamatan Baru'}
        description={
          open === 'edit' ? 'Perbarui kode resmi, nama, atau kabupaten induk kecamatan.' : 'Daftarkan kecamatan baru ke dalam katalog wilayah sistem.'
        }
        maxWidth="sm:max-w-xl"
      >
        <DistrictForm currentRow={currentRow} onSuccess={() => setOpen(null)} />
      </ActionDialog>

      {/* View Detail Dialog */}
      <Dialog open={isViewOpen} onOpenChange={(isOpen) => !isOpen && setOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>Rincian Data Kecamatan</DialogTitle>
            <DialogDescription className="text-xs">Informasi data wilayah dan kabupaten induk terdaftar.</DialogDescription>
          </DialogHeader>

          {currentRow && (
            <div className="space-y-3 pt-2 text-xs">
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">Nama Kecamatan</span>
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
                <span className="text-muted-foreground font-medium">Kabupaten Induk</span>
                <span className="text-foreground col-span-2 font-medium">{currentRow.city_id ? currentRow.city_id[1] : '-'}</span>
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
        title={currentRow?.active ? 'Arsipkan Kecamatan' : 'Pulihkan Kecamatan'}
        desc={`Apakah Anda yakin ingin ${currentRow?.active ? 'menonaktifkan' : 'mengaktifkan'} status wilayah ${currentRow?.name}?`}
        confirmText={currentRow?.active ? 'Arsipkan' : 'Pulihkan'}
        destructive={currentRow?.active}
        isLoading={isToggling}
        handleConfirm={handleToggleArchive}
      />
    </>
  )
}
