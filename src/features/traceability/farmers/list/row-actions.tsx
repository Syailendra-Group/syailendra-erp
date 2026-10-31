'use client'

import { useTranslations } from 'next-intl'

import { ActionButton } from '@/components/shared/action-button'

import { useFarmers } from '../context'

import type { ReactElement } from 'react'
import type { FarmerRecord } from '../actions'

export interface DataTableRowActionsProps {
  row: FarmerRecord
}

export function DataTableRowActions({ row }: DataTableRowActionsProps): ReactElement {
  const tCommon = useTranslations('common.actions')
  const { setOpen, setCurrentRow } = useFarmers()

  const farmerCode = row.ref || String(row.id)

  return (
    <div className="flex items-center justify-center gap-1">
      <ActionButton variant="view" label={tCommon('view')} href={`/traceability/farmers/${farmerCode}`} />
      <ActionButton variant="edit" label={tCommon('edit')} href={`/traceability/farmers/${farmerCode}/edit`} />
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
