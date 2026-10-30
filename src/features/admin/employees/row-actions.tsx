'use client'

import { useTranslations } from 'next-intl'

import { ActionButton } from '@/components/shared/action-button'
import { useEmployees } from '@/contexts/employees-context'

import type { ReactElement } from 'react'
import type { EmployeeRecord } from './actions'

export interface DataTableRowActionsProps {
  row: EmployeeRecord
}

export function DataTableRowActions({ row }: DataTableRowActionsProps): ReactElement {
  const { setOpen, setCurrentRow } = useEmployees()
  const tCommon = useTranslations('common.actions')

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
