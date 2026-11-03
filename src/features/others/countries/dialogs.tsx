'use client'

import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCountry } from '@/contexts/others/country.context'
import { useDeleteCountryMutation } from '@/hooks/others/use-countries'

import { CountryForm } from './form'

import type { ReactElement } from 'react'

export function CountryDialogs(): ReactElement {
  const { open, setOpen, currentRow } = useCountry()
  const { mutateAsync: deleteCountry, isPending: isDeleting } = useDeleteCountryMutation()

  const isFormOpen = open === 'create' || open === 'edit'
  const isViewOpen = open === 'view'
  const isDeleteOpen = open === 'delete'

  const handleDelete = async () => {
    if (!currentRow?.id) return
    try {
      const res = await deleteCountry(currentRow.id)
      if (res.success) {
        toast.success(`Negara ${currentRow.name} berhasil dihapus`)
        setOpen(null)
      } else {
        toast.error(res.error || 'Gagal menghapus negara')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus negara')
    }
  }

  return (
    <>
      {/* Create / Edit ActionDialog */}
      <ActionDialog
        open={isFormOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        formId="country-action-form"
        isEdit={open === 'edit'}
        title={open === 'edit' ? 'Ubah Data Negara' : 'Registrasi Negara Baru'}
        description={
          open === 'edit'
            ? 'Perbarui kode ISO, nama resmi, mata uang, atau kode telepon negara.'
            : 'Daftarkan negara baru ke dalam katalog resmi sistem.'
        }
        maxWidth="sm:max-w-lg"
      >
        <CountryForm currentRow={currentRow} onSuccess={() => setOpen(null)} />
      </ActionDialog>

      {/* View Detail Dialog */}
      <Dialog open={isViewOpen} onOpenChange={(isOpen) => !isOpen && setOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>Rincian Data Negara</DialogTitle>
            <DialogDescription className="text-xs">Informasi lengkap kode ISO dan mata uang resmi negara.</DialogDescription>
          </DialogHeader>

          {currentRow && (
            <div className="space-y-3 pt-2 text-xs">
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">Nama Negara</span>
                <span className="text-foreground col-span-2 font-semibold">{currentRow.name}</span>
              </div>
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">Kode ISO</span>
                <span className="text-foreground col-span-2 font-mono font-bold">{currentRow.code}</span>
              </div>
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">Kode Telepon</span>
                <span className="text-foreground col-span-2 font-mono">{currentRow.phone_code ? `+${currentRow.phone_code}` : '-'}</span>
              </div>
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">Mata Uang</span>
                <span className="text-foreground col-span-2">{currentRow.currency_id ? currentRow.currency_id[1] : '-'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5">
                <span className="text-muted-foreground font-medium">Catatan / Deskripsi</span>
                <span className="text-foreground col-span-2 italic">{currentRow.description || '-'}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        title="Hapus Data Negara"
        desc={`Apakah Anda yakin ingin menghapus negara ${currentRow?.name} (${currentRow?.code})? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Negara"
        destructive={true}
        isLoading={isDeleting}
        handleConfirm={handleDelete}
      />
    </>
  )
}
