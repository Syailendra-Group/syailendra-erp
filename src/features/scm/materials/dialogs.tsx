/**
 * dialogs.tsx — Dialogs suite (View Detail & Delete) for Material Master
 * Syailendra Group ERP — SCM Pillar
 */

'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { DetailRow } from '@/components/shared/detail-row'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMaterial } from '@/contexts/scm/material.context'
import { useDeleteMaterialMutation } from '@/hooks/scm/use-materials'

import type { ReactElement } from 'react'

export function MaterialsDialogs(): ReactElement {
  const { open, setOpen, currentRow } = useMaterial()
  const t = useTranslations('scm.materials')
  const { mutateAsync: deleteMaterial, isPending: isDeleting } = useDeleteMaterialMutation()

  const isViewOpen = open === 'view'
  const isDeleteOpen = open === 'delete'

  const handleDelete = async () => {
    if (!currentRow?.id) return
    try {
      const res = await deleteMaterial(currentRow.id)
      if (res.success) {
        toast.success(t('toasts.deletedSuccess', { name: currentRow.name }))
        setOpen(null)
      } else {
        toast.error(res.error || t('toasts.deleteRestrictedError', { name: currentRow.name }))
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toasts.errorOccurred'))
    }
  }

  return (
    <>
      <Dialog open={isViewOpen} onOpenChange={(isOpen) => !isOpen && setOpen(null)}>
        <DialogContent className="flex max-h-[85vh] flex-col p-0 sm:max-w-2xl">
          <DialogHeader className="p-6 pb-2 text-start">
            <div className="flex items-center gap-2">
              <span className="text-primary font-mono text-xs font-bold">{currentRow?.default_code}</span>
              <Badge variant="outline" className="font-mono text-[11px] uppercase">
                {currentRow ? t(`trackingOptions.${currentRow.tracking}`) : ''}
              </Badge>
            </div>
            <DialogTitle className="text-base sm:text-lg">{currentRow?.name}</DialogTitle>
            <DialogDescription className="text-xs">{t('dialog.viewDesc')}</DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="space-y-4">
              <div className="bg-muted/20 space-y-1 rounded-md border p-3">
                <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                  {t('sections.commercialAndBotanical')}
                </span>
                <DetailRow label={t('fields.defaultCode')} value={currentRow?.default_code || '-'} mono />
                <DetailRow label={t('fields.name')} value={currentRow?.name || '-'} />
                <DetailRow label={t('fields.commercialName')} value={currentRow?.commercial_name || '-'} />
                <DetailRow label={t('fields.category')} value={currentRow ? t(`categories.${currentRow.category}`) : '-'} />
                <DetailRow label={t('fields.botanicalName')} value={currentRow?.botanical_name || '-'} />
                <DetailRow label={t('fields.family')} value={currentRow?.family || '-'} />
                <DetailRow label={t('fields.inciName')} value={currentRow?.inci_name || '-'} />
                <DetailRow label={t('fields.plantPart')} value={currentRow?.plant_part || '-'} />
                <DetailRow label={t('fields.extractionMethod')} value={currentRow ? t(`extractionMethods.${currentRow.extraction_method}`) : '-'} />
                <DetailRow label={t('fields.aromaNote')} value={currentRow?.aroma_note ? t(`aromaNotes.${currentRow.aroma_note}`) : '-'} />
                <DetailRow label={t('fields.uom')} value={currentRow?.uom_id ? currentRow.uom_id[1] : '-'} mono />
                <DetailRow
                  label={t('fields.shelfLifeMonths')}
                  value={currentRow?.shelf_life_months ? `${currentRow.shelf_life_months} mo` : '-'}
                  mono
                  border={false}
                />
              </div>

              <div className="bg-muted/20 space-y-1 rounded-md border p-3">
                <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">{t('sections.exportCompliance')}</span>
                <DetailRow label={t('fields.casNumber')} value={currentRow?.cas_number || '-'} mono />
                <DetailRow label={t('fields.einecsNumber')} value={currentRow?.einecs_number || '-'} mono />
                <DetailRow label={t('fields.femaNumber')} value={currentRow?.fema_number || '-'} mono />
                <DetailRow label={t('fields.hsCode')} value={currentRow?.hs_code || '-'} mono border={false} />
              </div>

              <div className="bg-muted/20 space-y-1 rounded-md border p-3">
                <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">{t('sections.qcStandards')}</span>
                <DetailRow label={t('fields.relativeDensity')} value={currentRow?.qc_specs?.relative_density_20c || '-'} mono />
                <DetailRow label={t('fields.refractiveIndex')} value={currentRow?.qc_specs?.refractive_index_20c || '-'} mono />
                <DetailRow label={t('fields.opticalRotation')} value={currentRow?.qc_specs?.optical_rotation_20c || '-'} mono />
                <DetailRow
                  label={t('fields.flashPoint')}
                  value={currentRow?.qc_specs?.flash_point_c !== undefined ? `${currentRow.qc_specs.flash_point_c} °C` : '-'}
                  mono
                />
                <DetailRow label={t('fields.ethanolSolubility')} value={currentRow?.qc_specs?.ethanol_solubility || '-'} />
                <DetailRow label={t('fields.keyCompounds')} value={currentRow?.qc_specs?.key_compounds || '-'} />
                <DetailRow
                  label={t('fields.maxMoisture')}
                  value={currentRow?.qc_specs?.max_moisture_pct !== undefined ? `${currentRow.qc_specs.max_moisture_pct} %` : '-'}
                  mono
                />
                <DetailRow
                  label={t('fields.minYield')}
                  value={currentRow?.qc_specs?.min_yield_pct !== undefined ? `${currentRow.qc_specs.min_yield_pct} %` : '-'}
                  mono
                  border={false}
                />
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        title={t('deleteDialog.title')}
        desc={t('deleteDialog.description', {
          name: currentRow?.name || '',
          code: currentRow?.default_code || ''
        })}
        confirmText={t('deleteDialog.confirm')}
        cancelBtnText={t('deleteDialog.cancel')}
        destructive
        handleConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  )
}
