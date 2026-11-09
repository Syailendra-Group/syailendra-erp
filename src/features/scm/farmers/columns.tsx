'use client'

import { Phone, User } from 'lucide-react'

import { ActionButton } from '@/components/button/action-button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { IconText, LongText, PrimaryText } from '@/components/text'

import type { FarmerRecord } from '@/types/scm/farmer'
import type { ColumnDef } from '@tanstack/react-table'

export interface GetColumnsOptions {
  t?: (key: string) => string
  tTrace?: (key: string) => string
  tCommon: (key: string) => string
  onView?: (farmer: FarmerRecord) => void
  onEdit?: (farmer: FarmerRecord) => void
  onDelete?: (farmer: FarmerRecord) => void
}

export function getColumns({ t: tProp, tTrace, tCommon, onView, onEdit, onDelete }: GetColumnsOptions): ColumnDef<FarmerRecord>[] {
  const t = (tProp || tTrace)!
  return [
    {
      accessorKey: 'ref',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.ref') || 'Farmer ID'} />,
      cell: ({ row }) => <PrimaryText fallback="-">{row.original.ref}</PrimaryText>,
      enableSorting: true
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.name')} />,
      cell: ({ row }) => (
        <IconText icon={User} className="max-w-55 text-xs font-semibold">
          <LongText>{row.original.name}</LongText>
        </IconText>
      ),
      enableSorting: true
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.phone')} />,
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
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.location')} />,
      cell: ({ row }) => {
        const item = row.original
        const loc = [item.city, item.state_id ? item.state_id[1] : ''].filter(Boolean).join(', ')
        return <LongText className="text-muted-foreground block max-w-45 text-xs">{loc || '-'}</LongText>
      }
    },
    {
      accessorKey: 'active',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.status')} />,
      cell: ({ row }) => {
        const active = row.original.active
        return (
          <StatusBadge variant={active ? 'success' : 'neutral'} size="sm">
            {active ? t('status.active') : t('status.archived')}
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
