'use client'

import { ActionButton } from '@/components/button/action-button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { DataBadge } from '@/components/shared/data-badge'
import { CoordsLink, LongText, PrimaryText } from '@/components/text'

import type { ProvinceRecord } from '@/types/others/province'
import type { ColumnDef } from '@tanstack/react-table'

export interface GetColumnsOptions {
  t: (key: string) => string
  tCommon: (key: string) => string
  onView: (item: ProvinceRecord) => void
  onEdit: (province: ProvinceRecord) => void
  onDelete: (province: ProvinceRecord) => void
}

export function getColumns({ t, tCommon, onView, onEdit, onDelete }: GetColumnsOptions): ColumnDef<ProvinceRecord>[] {
  return [
    {
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.code')} />,
      cell: ({ row }) => <PrimaryText fallback="-">{row.original.code}</PrimaryText>,
      enableSorting: true
    },
    {
      accessorKey: 'prefix',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.prefix')} />,
      cell: ({ row }) => {
        const val = row.original.prefix
        return val ? (
          <DataBadge variant="primary" size="sm" className="font-mono text-xs">
            {val}
          </DataBadge>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        )
      },
      enableSorting: true
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.name')} />,
      cell: ({ row }) => <LongText className="text-muted-foreground block max-w-50 text-xs">{row.original.name}</LongText>,
      enableSorting: true
    },
    {
      accessorKey: 'alias',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.alias') || 'Alias'} />,
      cell: ({ row }) => <LongText className="text-muted-foreground block max-w-50 text-xs">{row.original.alias || '-'}</LongText>,
      enableSorting: true
    },
    {
      accessorKey: 'country_id',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.country')} />,
      cell: ({ row }) => {
        const country = row.original.country_id
        return <LongText className="text-muted-foreground block max-w-50 text-xs">{country ? country[1] : '-'}</LongText>
      }
    },
    {
      accessorKey: 'latitude',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tCommon('table.coordinates')} />,
      cell: ({ row }) => <CoordsLink lat={row.original.latitude} lng={row.original.longitude} />
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
