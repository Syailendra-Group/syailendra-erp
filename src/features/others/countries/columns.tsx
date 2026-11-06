'use client'

import { ActionButton } from '@/components/button/action-button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { LongText, PrimaryText } from '@/components/text'

import type { CountryRecord } from '@/types/others/country'
import type { ColumnDef } from '@tanstack/react-table'

export interface GetColumnsOptions {
  t: (key: string) => string
  tCommon: (key: string) => string
  onView: (country: CountryRecord) => void
  onEdit: (country: CountryRecord) => void
  onDelete: (country: CountryRecord) => void
}

export function getColumns({ t, tCommon, onView, onEdit, onDelete }: GetColumnsOptions): ColumnDef<CountryRecord>[] {
  return [
    {
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.code')} />,
      cell: ({ row }) => <PrimaryText fallback="-">{row.original.code}</PrimaryText>,
      enableSorting: true
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.name')} />,
      cell: ({ row }) => <LongText className="text-muted-foreground block max-w-50 text-xs">{row.original.name}</LongText>,
      enableSorting: true
    },
    {
      accessorKey: 'phone_code',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.phoneCode')} />,
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-xs">{row.original.phone_code ? `+${row.original.phone_code}` : '-'}</span>
      ),
      enableSorting: true
    },
    {
      id: 'actions',
      header: () => <div className="text-center text-xs font-semibold">{tCommon('table.actions')}</div>,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center justify-center gap-1">
            <ActionButton variant="view" label={tCommon('actions.view')} onClick={() => onView(item)} />
            <ActionButton variant="edit" label={tCommon('actions.edit')} onClick={() => onEdit(item)} />
            <ActionButton variant="delete" label={tCommon('actions.delete')} onClick={() => onDelete(item)} />
          </div>
        )
      }
    }
  ]
}
