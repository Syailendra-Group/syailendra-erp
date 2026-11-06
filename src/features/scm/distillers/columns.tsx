/**
 * columns.tsx — Standardized TanStack Table columns for Distillers Master Data
 * Syailendra Group ERP (SCM Pillar)
 * Complies with octadev-coding-rules-v84
 */

'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Factory, Flame, Gauge } from 'lucide-react'

import { ActionButton } from '@/components/button/action-button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { IconText, LongText, PrimaryText } from '@/components/text'
import { Badge } from '@/components/ui/badge'

import type { DistillerRecord } from '@/types/scm/distiller'

export interface GetColumnsOptions {
  t?: (key: string) => string
  tTrace: (key: string) => string
  tCommon: (key: string) => string
  onView?: (item: DistillerRecord) => void
  onEdit?: (item: DistillerRecord) => void
  onDelete?: (item: DistillerRecord) => void
}

export function getColumns({ tTrace, tCommon, onView, onEdit, onDelete }: GetColumnsOptions): ColumnDef<DistillerRecord>[] {
  return [
    {
      accessorKey: 'ref',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('table.code')} />,
      cell: ({ row }) => <PrimaryText fallback="-">{row.original.ref}</PrimaryText>,
      enableSorting: true
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('table.name')} />,
      cell: ({ row }) => (
        <IconText icon={Factory} className="max-w-[220px] text-xs font-semibold">
          <LongText>{row.original.name}</LongText>
        </IconText>
      ),
      enableSorting: true
    },
    {
      accessorKey: 'method',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('table.method') || 'Metode'} />,
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] font-normal">
          <IconText icon={Flame} iconClassName="text-amber-500 h-3 w-3">
            {row.original.method || '-'}
          </IconText>
        </Badge>
      )
    },
    {
      accessorKey: 'boiler_capacity_kg',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('table.capacity') || 'Kapasitas'} />,
      cell: ({ row }) => (
        <IconText icon={Gauge} mono className="text-muted-foreground">
          {row.original.boiler_capacity_kg ? `${row.original.boiler_capacity_kg} Kg` : '-'}
        </IconText>
      ),
      enableSorting: true
    },
    {
      accessorKey: 'city',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('table.location')} />,
      cell: ({ row }) => {
        const item = row.original
        return (
          <span className="text-muted-foreground block max-w-[180px] text-xs">
            <LongText>{item.city || '-'}</LongText>
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
          <StatusBadge variant={active ? 'success' : 'neutral'} size="sm">
            {active ? tTrace('status.active') : tTrace('status.archived')}
          </StatusBadge>
        )
      },
      enableSorting: true
    },
    {
      id: 'actions',
      header: () => <div className="text-center">{tCommon('table.actions')}</div>,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center justify-center gap-1">
            <ActionButton variant="view" label={tCommon('actions.view')} onClick={() => onView?.(item)} />
            <ActionButton variant="edit" label={tCommon('actions.edit')} onClick={() => onEdit?.(item)} />
            <ActionButton variant="delete" label={tCommon('actions.delete')} onClick={() => onDelete?.(item)} />
          </div>
        )
      }
    }
  ]
}
