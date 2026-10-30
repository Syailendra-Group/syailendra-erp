'use client'

import { useTransition } from 'react'
import { ExternalLink, MapPin, Phone, UserCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { toggleFarmerStatusAction } from './actions'
import { useFarmers } from './context'

import type { ReactElement } from 'react'

export function FarmersDialogs(): ReactElement {
  const tTrace = useTranslations('traceability.farmers')
  const tCommon = useTranslations('common')
  const { open, setOpen, currentRow, setCurrentRow, refreshData } = useFarmers()
  const [isPending, startTransition] = useTransition()

  const handleToggleStatus = () => {
    if (!currentRow) return
    const targetStatus = !currentRow.active

    startTransition(async () => {
      const res = await toggleFarmerStatusAction(currentRow.id, targetStatus)
      if (res.success) {
        toast.success(targetStatus ? tTrace('messages.restored') : tTrace('messages.archived'))
        refreshData()
        setOpen(null)
      } else {
        toast.error(res.error || (targetStatus ? tTrace('messages.restoreFailed') : tTrace('messages.archiveFailed')))
      }
    })
  }

  return (
    <>
      {/* 1. View Farmer & Plantation Modal */}
      <Dialog
        open={open === 'view'}
        onOpenChange={(v) => {
          if (!v) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary rounded-md p-1.5">
                <UserCheck className="size-4" />
              </div>
              <DialogTitle className="text-base">{tTrace('dialog.viewTitle')}</DialogTitle>
            </div>
            <DialogDescription className="text-xs">{tTrace('dialog.viewDesc')}</DialogDescription>
          </DialogHeader>

          {currentRow && (
            <div className="space-y-3.5 py-2 text-xs">
              <div className="bg-muted/20 grid grid-cols-2 gap-2.5 rounded-lg border p-3">
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Farmer ID</span>
                  <span className="text-primary font-mono font-bold">{currentRow.ref}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Status Kemitraan</span>
                  <Badge variant="outline" className="mt-0.5 text-[10px]">
                    {currentRow.active ? tTrace('status.activeVerified') : tTrace('status.archived')}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nama Petani / Kelompok:</span>
                  <span className="font-semibold">{currentRow.name}</span>
                </div>
                {currentRow.vat && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nomor NIK (KTP):</span>
                    <span className="font-mono">{currentRow.vat}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alamat / Desa:</span>
                  <span className="text-end font-medium">
                    {currentRow.street}, {currentRow.city}
                  </span>
                </div>
                {currentRow.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Kontak:</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="text-muted-foreground size-3" />
                      {currentRow.phone}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Titik Koordinat GPS:</span>
                  {currentRow.partner_latitude && currentRow.partner_longitude ? (
                    <a
                      href={`https://www.google.com/maps?q=${currentRow.partner_latitude},${currentRow.partner_longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-mono text-blue-600 hover:underline dark:text-blue-400"
                    >
                      <MapPin className="size-3" />
                      <span>
                        {currentRow.partner_latitude.toFixed(4)}, {currentRow.partner_longitude.toFixed(4)}
                      </span>
                      <ExternalLink className="ml-0.5 size-2.5" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground italic">Belum disetel</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Komoditas & Metode:</span>
                  <span className="font-semibold capitalize">
                    {currentRow.commodity} • {currentRow.farming_method || 'Organik'}
                  </span>
                </div>
              </div>

              {currentRow.comment && (
                <div className="bg-muted/40 rounded-lg p-2.5">
                  <span className="text-muted-foreground mb-1 block text-[10px] font-semibold uppercase">Catatan Agronomist</span>
                  <p className="text-muted-foreground text-[11px] leading-relaxed italic">{currentRow.comment}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setOpen(null)
                setCurrentRow(null)
              }}
            >
              {tCommon('actions.cancel')}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setOpen('edit')
              }}
            >
              {tCommon('actions.edit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Confirm Archive / Restore Dialog */}
      <ConfirmDialog
        open={open === 'archive'}
        onOpenChange={(v) => {
          if (!v) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
        handleConfirm={handleToggleStatus}
        isLoading={isPending}
        title={currentRow?.active ? tTrace('confirm.archiveTitle') : tTrace('confirm.restoreTitle')}
        desc={
          currentRow?.active
            ? tTrace('confirm.archiveDesc', { name: currentRow?.name || '' })
            : tTrace('confirm.restoreDesc', { name: currentRow?.name || '' })
        }
        confirmText={currentRow?.active ? tCommon('actions.archive') : tCommon('actions.restore')}
        destructive={currentRow?.active}
      />
    </>
  )
}
