'use client'

import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { StatusBadge } from '@/components/shared/status-badge'

import type { CountryRecord } from '@/types/others/country'
import type { ColumnDef } from '@tanstack/react-table'

export interface GetColumnsOptions {
  t: (key: string) => string
}

export function getColumns({ t }: GetColumnsOptions): ColumnDef<CountryRecord>[] {
  return [
    {
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.code')} />,
      cell: ({ row }) => <span className="text-primary font-mono text-xs font-semibold">{row.original.code}</span>,
      enableSorting: true
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.name')} />,
      cell: ({ row }) => <span className="text-foreground text-xs font-semibold sm:text-sm">{row.original.name}</span>,
      enableSorting: true
    },
    {
      accessorKey: 'phone_code',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.phoneCode')} />,
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-xs">{row.original.phone_code ? `+${row.original.phone_code}` : '-'}</span>
      )
    },
    {
      accessorKey: 'currency_id',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.currency')} />,
      cell: ({ row }) => {
        const curr = row.original.currency_id
        return curr ? <StatusBadge variant="neutral">{curr[1]}</StatusBadge> : <span className="text-muted-foreground text-xs">-</span>
      }
    }
  ]
}
