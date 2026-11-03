'use client'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useProvince } from '@/contexts/others/province.context'

import { ProvinceForm } from './form'

import type { ReactElement } from 'react'

export function ProvincesDialogs(): ReactElement {
  const { open, setOpen, currentRow } = useProvince()

  const isFormOpen = open === 'create' || open === 'edit' || open === 'add'
  const isViewOpen = open === 'view'

  return (
    <>
      {/* Form ActionDialog */}
      <ActionDialog
        open={isFormOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        formId="province-action-form"
        isEdit={open === 'edit'}
        title={open === 'edit' ? 'Ubah Data Provinsi' : 'Registrasi Provinsi Baru'}
        description={open === 'edit' ? 'Perbarui kode resmi atau nama provinsi.' : 'Daftarkan provinsi baru ke dalam katalog wilayah sistem.'}
        maxWidth="sm:max-w-lg"
      >
        <ProvinceForm currentRow={currentRow} onSuccess={() => setOpen(null)} />
      </ActionDialog>

      {/* View Detail Dialog */}
      <Dialog open={isViewOpen} onOpenChange={(isOpen) => !isOpen && setOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>Rincian Data Provinsi</DialogTitle>
            <DialogDescription className="text-xs">Informasi data wilayah dan negara induk terdaftar.</DialogDescription>
          </DialogHeader>

          {currentRow && (
            <div className="space-y-3 pt-2 text-xs">
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">Nama Provinsi</span>
                <span className="text-foreground col-span-2 font-semibold">{currentRow.name}</span>
              </div>
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">Kode BPS/ISO</span>
                <span className="text-foreground col-span-2 font-mono font-bold">{currentRow.code}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5">
                <span className="text-muted-foreground font-medium">Negara Induk</span>
                <span className="text-foreground col-span-2 font-medium">{currentRow.country_id ? currentRow.country_id[1] : '-'}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
