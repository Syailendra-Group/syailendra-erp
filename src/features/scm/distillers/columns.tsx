'use client'

import { Phone, UserCheck } from 'lucide-react'

import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { StatusBadge } from '@/components/shared/status-badge'

import { DataTableRowActions } from './row-actions'

import type { DistillerRecord } from '@/types/scm/distiller'
import type { ColumnDef } from '@tanstack/react-table'

export interface GetColumnsOptions {
  tTrace: (key: string) => string
  tCommon: (key: string) => string
}

export function getColumns({ tTrace, tCommon }: GetColumnsOptions): ColumnDef<DistillerRecord>[] {
  return [
    {
      accessorKey: 'ref',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('distillers.table.ref')} />,
      cell: ({ row }) => <span className="text-primary font-mono text-xs font-semibold">{row.original.ref}</span>,
      enableSorting: true
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('distillers.table.name')} />,
      cell: ({ row }) => {
        const d = row.original
        return (
          <div>
            <div className="text-foreground text-xs font-semibold sm:text-sm">{d.name}</div>
            <span className="text-muted-foreground font-mono text-[10px] uppercase">{d.boiler_material}</span>
          </div>
        )
      },
      enableSorting: true
    },
    {
      accessorKey: 'boiler_capacity_kg',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('distillers.table.capacity')} />,
      cell: ({ row }) => {
        return <span className="text-foreground font-mono text-xs font-semibold">{row.original.boiler_capacity_kg} Kg</span>
      },
      enableSorting: true
    },
    {
      accessorKey: 'method',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('distillers.table.method')} />,
      cell: ({ row }) => {
        const m = row.original.method || 'steam'
        const label = tTrace(`distillers.methods.${m}`) || m
        return <StatusBadge variant="info">{label}</StatusBadge>
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id))
      }
    },
    {
      accessorKey: 'operator_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('distillers.table.operator')} />,
      cell: ({ row }) => {
        const d = row.original
        return (
          <div className="text-xs">
            <span className="text-foreground flex items-center gap-1 font-medium">
              <UserCheck className="text-primary size-3 shrink-0" />
              {d.operator_name}
            </span>
            {d.phone && (
              <span className="text-muted-foreground mt-0.5 flex items-center gap-1 font-mono text-[11px]">
                <Phone className="size-2.5" />
                {d.phone}
              </span>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: 'city',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('distillers.table.location')} />,
      cell: ({ row }) => {
        const d = row.original
        return (
          <div className="text-xs">
            <span className="text-foreground font-medium">{d.city}</span>
            <span className="text-muted-foreground block max-w-[150px] truncate text-[11px]">{d.street}</span>
          </div>
        )
      }
    },
    {
      accessorKey: 'active',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('distillers.table.status')} />,
      cell: ({ row }) => {
        const active = row.original.active
        return <StatusBadge variant={active ? 'success' : 'warning'}>{active ? tCommon('status.active') : tCommon('status.archived')}</StatusBadge>
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(String(row.getValue(id)))
      }
    },
    {
      id: 'actions',
      header: () => <div className="text-center text-xs">{tCommon('table.actions')}</div>,
      cell: ({ row }) => <DataTableRowActions row={row.original} />,
      enableSorting: false,
      enableHiding: false
    }
  ]
}
