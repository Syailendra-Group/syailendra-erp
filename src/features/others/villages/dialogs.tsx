'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useVillage } from '@/contexts/others/village.context'

import { VillageForm } from './form'

import type { ReactElement } from 'react'

export function VillagesDialogs(): ReactElement {
  const { open, setOpen, currentRow } = useVillage()
  const t = useTranslations('others.villages')
  const tReg = useTranslations('regional.common')
  const [canSubmit, setCanSubmit] = useState(true)

  const isFormOpen = open === 'create' || open === 'edit'
  const isViewOpen = open === 'view'

  return (
    <>
      {/* Form ActionDialog */}
      <ActionDialog
        open={isFormOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        formId="village-action-form"
        isEdit={open === 'edit'}
        submitDisabled={!canSubmit}
        title={open === 'edit' ? t('dialog.editTitle') : t('dialog.addTitle')}
        description={open === 'edit' ? t('dialog.editDesc') : t('dialog.addDesc')}
        maxWidth="sm:max-w-xl"
      >
        <VillageForm currentRow={currentRow} onSuccess={() => setOpen(null)} onValidationChange={setCanSubmit} />
      </ActionDialog>

      {/* View Detail Dialog */}
      <Dialog open={isViewOpen} onOpenChange={(isOpen) => !isOpen && setOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>{t('dialog.viewTitle')}</DialogTitle>
            <DialogDescription className="text-xs">{t('dialog.viewDesc')}</DialogDescription>
          </DialogHeader>

          {currentRow && (
            <div className="space-y-3 pt-2 text-xs">
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">{t('table.name')}</span>
                <span className="text-foreground col-span-2 font-semibold">{currentRow.name}</span>
              </div>
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">{tReg('fields.alias')}</span>
                <span className="text-foreground col-span-2">{currentRow.alias || '-'}</span>
              </div>
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">{t('table.code')}</span>
                <span className="text-foreground col-span-2 font-mono font-bold">{currentRow.code || '-'}</span>
              </div>
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">{t('table.district')}</span>
                <span className="text-foreground col-span-2 font-medium">{currentRow.district_id ? currentRow.district_id[1] : '-'}</span>
              </div>
              <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                <span className="text-muted-foreground font-medium">{t('table.zipCode')}</span>
                <span className="text-foreground col-span-2 font-mono">{currentRow.zip_code || '-'}</span>
              </div>
              {currentRow.city_id && (
                <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                  <span className="text-muted-foreground font-medium">Kabupaten/Kota</span>
                  <span className="text-foreground col-span-2 font-medium">{currentRow.city_id[1]}</span>
                </div>
              )}
              {currentRow.country_id && (
                <div className="border-border/40 grid grid-cols-3 gap-2 border-b py-1.5">
                  <span className="text-muted-foreground font-medium">Negara</span>
                  <span className="text-foreground col-span-2 font-medium">{currentRow.country_id[1]}</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 py-1.5">
                <span className="text-muted-foreground font-medium">{tReg('fields.description')}</span>
                <span className="text-foreground col-span-2 italic">{currentRow.description || '-'}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
