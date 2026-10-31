'use client'

import { MapPin, Phone } from 'lucide-react'

import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { Badge } from '@/components/ui/badge'

import { DataTableRowActions } from './row-actions'

import type { ColumnDef } from '@tanstack/react-table'
import type { FarmerRecord } from '../actions'

export interface GetColumnsOptions {
  tTrace: (key: string) => string
  tCommon: (key: string) => string
}

export function getColumns({ tTrace, tCommon }: GetColumnsOptions): ColumnDef<FarmerRecord>[] {
  return [
    {
      accessorKey: 'ref',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('table.ref')} />,
      cell: ({ row }) => <span className="text-primary font-mono text-xs font-semibold">{row.original.ref}</span>,
      enableSorting: true
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('table.name')} />,
      cell: ({ row }) => {
        const farmer = row.original
        return (
          <div>
            <div className="text-foreground text-xs font-semibold sm:text-sm">{farmer.name}</div>
            {farmer.vat && <span className="text-muted-foreground font-mono text-[10px]">NIK: {farmer.vat}</span>}
          </div>
        )
      },
      enableSorting: true
    },
    {
      accessorKey: 'city',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('table.location')} />,
      cell: ({ row }) => {
        const f = row.original
        return (
          <div className="text-xs">
            <span className="text-foreground font-medium">{f.city}</span>
            <span className="text-muted-foreground block max-w-[180px] truncate text-[11px]">{f.street}</span>
          </div>
        )
      }
    },
    {
      accessorKey: 'commodity',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('table.commodity')} />,
      cell: ({ row }) => {
        const cmd = row.original.commodity || 'gaharu'
        const label = tTrace(`commodities.${cmd}`) || cmd
        return (
          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-[10px] font-semibold">
            {label}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id))
      }
    },
    {
      accessorKey: 'partner_latitude',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('table.coordinates')} />,
      cell: ({ row }) => {
        const f = row.original
        if (!f.partner_latitude || !f.partner_longitude) {
          return <span className="text-muted-foreground text-xs italic">-</span>
        }
        return (
          <a
            href={`https://www.google.com/maps?q=${f.partner_latitude},${f.partner_longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-mono text-[11px] text-blue-600 hover:underline dark:text-blue-400"
          >
            <MapPin className="size-3 shrink-0" />
            <span>
              {f.partner_latitude.toFixed(4)}, {f.partner_longitude.toFixed(4)}
            </span>
          </a>
        )
      }
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('table.phone')} />,
      cell: ({ row }) => {
        const phone = row.original.phone
        if (!phone) return <span className="text-muted-foreground text-xs italic">-</span>
        return (
          <span className="text-muted-foreground flex items-center gap-1 font-mono text-xs">
            <Phone className="size-3" />
            <span>{phone}</span>
          </span>
        )
      }
    },
    {
      accessorKey: 'active',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('table.status')} />,
      cell: ({ row }) => {
        const active = row.original.active
        return (
          <Badge
            variant="outline"
            className={
              active
                ? 'border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400'
                : 'border-muted-foreground/20 bg-muted/20 text-muted-foreground text-[10px]'
            }
          >
            {active ? tCommon('status.active') : tCommon('status.archived')}
          </Badge>
        )
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
