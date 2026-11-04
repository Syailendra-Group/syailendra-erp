'use client'

import { useTranslations } from 'next-intl'

import { ActionButton } from '@/components/button/action-button'
import { useDistillers } from '@/contexts/scm/distiller.context'

import type { DistillerRecord } from '@/actions/scm/distiller.action'
import type { ReactElement } from 'react'

export interface DataTableRowActionsProps {
  row: DistillerRecord
}

export function DataTableRowActions({ row }: DataTableRowActionsProps): ReactElement {
  const tCommon = useTranslations('common.actions')
  const { setOpen, setCurrentRow } = useDistillers()

  return (
    <div className="flex items-center justify-center gap-1">
      <ActionButton
        variant="view"
        label={tCommon('view')}
        onClick={() => {
          setCurrentRow(row)
          setOpen('view')
        }}
      />
      <ActionButton
        variant="edit"
        label={tCommon('edit')}
        onClick={() => {
          setCurrentRow(row)
          setOpen('edit')
        }}
      />
      <ActionButton
        variant={row.active ? 'archive' : 'restore'}
        label={row.active ? tCommon('archive') : tCommon('restore')}
        onClick={() => {
          setCurrentRow(row)
          setOpen('archive')
        }}
      />
    </div>
  )
}
