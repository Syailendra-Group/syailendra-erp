'use client'

import { ActionButton } from '@/components/button/action-button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'

import type { VillageRecord } from '@/types/others/village'
import type { ColumnDef } from '@tanstack/react-table'

export interface GetColumnsOptions {
  t: (key: string) => string
  tCommon: (key: string) => string
  onView: (item: VillageRecord) => void
  onEdit: (village: VillageRecord) => void
}

export function getColumns({ t, tCommon, onView, onEdit }: GetColumnsOptions): ColumnDef<VillageRecord>[] {
  return [
    {
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.code')} />,
      cell: ({ row }) => <span className="text-primary font-mono text-xs font-semibold">{row.original.code || '-'}</span>,
      enableSorting: true
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.name')} />,
      cell: ({ row }) => <span className="text-foreground text-xs font-semibold sm:text-sm">{row.original.name}</span>,
      enableSorting: true
    },
    {
      accessorKey: 'alias',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.alias') || 'Alias'} />,
      cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.alias || '-'}</span>,
      enableSorting: true
    },
    {
      accessorKey: 'district_id',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.district')} />,
      cell: ({ row }) => {
        const dist = row.original.district_id
        return <span className="text-foreground text-xs font-medium">{dist ? dist[1] : '-'}</span>
      }
    },
    {
      accessorKey: 'zip_code',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.zipCode')} />,
      cell: ({ row }) => {
        const zip = row.original.zip_code
        return <span className="font-mono text-xs">{zip || '-'}</span>
      }
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
          </div>
        )
      }
    }
  ]
}
