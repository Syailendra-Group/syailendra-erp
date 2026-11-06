/**
 * columns.tsx — Standardized TanStack Table columns for Farmers Master Data
 * Syailendra Group ERP (SCM Pillar)
 * Complies with octadev-coding-rules-v84
 */

'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Phone, User } from 'lucide-react'

import { ActionButton } from '@/components/button/action-button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { IconText, LongText, PrimaryText } from '@/components/text'

import type { FarmerRecord } from '@/types/scm/farmer'

export interface GetColumnsOptions {
  t?: (key: string) => string
  tTrace: (key: string) => string
  tCommon: (key: string) => string
  onView?: (farmer: FarmerRecord) => void
  onEdit?: (farmer: FarmerRecord) => void
  onDelete?: (farmer: FarmerRecord) => void
}

export function getColumns({ tTrace, tCommon, onView, onEdit, onDelete }: GetColumnsOptions): ColumnDef<FarmerRecord>[] {
  return [
    {
      accessorKey: 'ref',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('table.ref') || 'Farmer ID'} />,
      cell: ({ row }) => <PrimaryText fallback="-">{row.original.ref}</PrimaryText>,
      enableSorting: true
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('table.name')} />,
      cell: ({ row }) => (
        <IconText icon={User} className="max-w-[220px] text-xs font-semibold">
          <LongText>{row.original.name}</LongText>
        </IconText>
      ),
      enableSorting: true
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('table.phone')} />,
      cell: ({ row }) => {
        const phone = row.original.phone
        return (
          <IconText icon={Phone} mono className="text-muted-foreground">
            <LongText>{phone || '-'}</LongText>
          </IconText>
        )
      }
    },
    {
      accessorKey: 'city',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tTrace('table.location')} />,
      cell: ({ row }) => {
        const item = row.original
        const loc = [item.city, item.state_id ? item.state_id[1] : ''].filter(Boolean).join(', ')
        return (
          <span className="text-muted-foreground block max-w-[180px] text-xs">
            <LongText>{loc || '-'}</LongText>
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
