'use client'

import { useTranslations } from 'next-intl'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { DetailRow } from '@/components/shared/detail-row'
import { Badge } from '@/components/ui/badge'
import { useMenu } from '@/contexts/others/menu.context'
import { PILLAR_ICONS } from '@/data/pillar-catalog'

import { PillarForm } from './form'

import type { ReactElement } from 'react'

export function MenusDialogs(): ReactElement {
  const { open, setOpen, currentRow } = useMenu()
  const t = useTranslations('others.menus')

  const isFormOpen = open === 'edit'
  const isViewOpen = open === 'view'

  const Icon = currentRow ? PILLAR_ICONS[currentRow.code] : undefined

  return (
    <>
      <ActionDialog
        open={isFormOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        formId="pillar-action-form"
        isEdit={true}
        title={t('dialog.editTitle', { code: currentRow?.short_name || '' })}
        description={t('dialog.editDesc')}
        maxWidth="sm:max-w-2xl"
      >
        <PillarForm currentRow={currentRow} onSuccess={() => setOpen(null)} />
      </ActionDialog>

      <ActionDialog
        open={isViewOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        isView={true}
        title={t('dialog.viewTitle')}
        description={t('dialog.viewDesc')}
        maxWidth="sm:max-w-2xl"
      >
        {currentRow && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg border">
                {Icon && <Icon className="size-5" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold">{currentRow.name}</h4>
                  <Badge variant="default" className="text-[10px] font-bold">
                    {currentRow.short_name}
                  </Badge>
                </div>
                {currentRow.tagline && <p className="text-muted-foreground text-xs italic">{currentRow.tagline}</p>}
              </div>
            </div>

            <div className="space-y-2 rounded-md border p-3.5 text-xs">
              <DetailRow label={t('table.shortName')} value={currentRow.short_name} mono />
              <DetailRow label={t('table.code')} value={currentRow.code} mono />
              <DetailRow label={t('table.owner')} value={`${currentRow.company_short_name} - ${currentRow.company_name}`} />
              <DetailRow label={t('table.sequence')} value={String(currentRow.sequence)} mono />
              <DetailRow label={t('table.description')} value={currentRow.description || '-'} border={false} />
            </div>
          </div>
        )}
      </ActionDialog>
    </>
  )
}
