'use client'

import { CheckCircle2, Factory, Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useDistillers } from '@/contexts/traceability/distiller.context'
import { useToggleDistillerStatusMutation } from '@/hooks/traceability/use-distillers'

import type { ReactElement } from 'react'

export function DistillersDialogs(): ReactElement {
  const tTrace = useTranslations('traceability.distillers')
  const tCommon = useTranslations('common')
  const { open, setOpen, currentRow, setCurrentRow, refreshData } = useDistillers()
  const { mutateAsync: toggleDistillerStatus, isPending } = useToggleDistillerStatusMutation()

  const handleToggleStatus = async () => {
    if (!currentRow) return
    const targetStatus = !currentRow.active

    try {
      const res = await toggleDistillerStatus({ id: currentRow.id, active: targetStatus })
      if (res.success) {
        toast.success(targetStatus ? tTrace('messages.restored') : tTrace('messages.archived'))
        refreshData()
        setOpen(null)
      } else {
        toast.error(res.error || (targetStatus ? tTrace('messages.restoreFailed') : tTrace('messages.archiveFailed')))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : targetStatus ? tTrace('messages.restoreFailed') : tTrace('messages.archiveFailed')
      toast.error(msg)
    }
  }

  return (
    <>
      {/* 1. View Distiller Details Modal */}
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
                <Factory className="size-4" />
              </div>
              <DialogTitle className="text-base">{tTrace('dialog.viewTitle')}</DialogTitle>
            </div>
            <DialogDescription className="text-xs">{tTrace('dialog.viewDesc')}</DialogDescription>
          </DialogHeader>

          {currentRow && (
            <div className="space-y-3.5 py-2 text-xs">
              <div className="bg-muted/20 grid grid-cols-2 gap-2.5 rounded-lg border p-3">
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Distiller ID</span>
                  <span className="text-primary font-mono font-bold">{currentRow.ref}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Status Operasional</span>
                  <Badge variant="outline" className="mt-0.5 text-[10px]">
                    {currentRow.active ? tTrace('status.operational') : tTrace('status.maintenance')}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nama Unit / Fasilitas:</span>
                  <span className="font-semibold">{currentRow.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kapasitas Muat Ketel:</span>
                  <span className="text-foreground font-mono font-bold">{currentRow.boiler_capacity_kg} Kg Biomassa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Metode Penyulingan:</span>
                  <span className="font-semibold capitalize">{tTrace(`methods.${currentRow.method}`) || currentRow.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Material Konstruksi:</span>
                  <span className="font-semibold uppercase">{currentRow.boiler_material}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kepemilikan:</span>
                  <span className="font-semibold">{tTrace(`ownership.${currentRow.ownership}`) || currentRow.ownership}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Operator / PIC:</span>
                  <span className="font-semibold">{currentRow.operator_name}</span>
                </div>
                {currentRow.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Kontak Operator:</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="text-muted-foreground size-3" />
                      {currentRow.phone}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alamat Fasilitas:</span>
                  <span className="text-end font-medium">
                    {currentRow.street}, {currentRow.city}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status Sanitasi Ketel:</span>
                  <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="mr-1 size-3" /> Sanitasi Terpenuhi (Passed)
                  </Badge>
                </div>
              </div>

              {currentRow.comment && (
                <div className="bg-muted/40 rounded-lg p-2.5">
                  <span className="text-muted-foreground mb-1 block text-[10px] font-semibold uppercase">Catatan Spesifikasi</span>
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
