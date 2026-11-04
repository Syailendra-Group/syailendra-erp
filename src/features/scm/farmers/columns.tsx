'use client'

import { ActionButton } from '@/components/button/action-button'

import type { FarmerRecord } from '@/types/scm/farmer'
import type { ColumnDef } from '@tanstack/react-table'

export interface GetColumnsProps {
  tTrace: (key: string) => string
  tCommon: (key: string) => string
}

export function getColumns({ tTrace, tCommon }: GetColumnsProps): ColumnDef<FarmerRecord>[] {
  return [
    {
      accessorKey: 'ref',
      header: tTrace('table.ref'),
      cell: ({ row }) => <span className="text-foreground font-mono text-xs font-bold">{row.original.ref}</span>
    },
    {
      accessorKey: 'name',
      header: tTrace('table.name'),
      cell: ({ row }) => <span className="text-foreground text-xs font-semibold">{row.original.name}</span>
    },
    {
      accessorKey: 'phone',
      header: tTrace('table.phone'),
      cell: ({ row }) => <span className="text-muted-foreground font-mono text-xs">{row.original.phone || '-'}</span>
    },
    {
      accessorKey: 'city',
      header: tTrace('table.location'),
      cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.city}</span>
    },
    {
      accessorKey: 'active',
      header: tTrace('table.status'),
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
            row.original.active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'
          }`}
        >
          {row.original.active ? tTrace('status.active') : tTrace('status.archived')}
        </span>
      )
    },
    {
      id: 'actions',
      header: () => <div className="text-center text-xs font-semibold">{tCommon('table.actions')}</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <ActionButton variant="view" label={tCommon('actions.view')} href={`/scm/farmers/${row.original.id}`} />
          <ActionButton variant="edit" label={tCommon('actions.edit')} href={`/scm/farmers/${row.original.id}/edit`} />
        </div>
      )
    }
  ]
}
