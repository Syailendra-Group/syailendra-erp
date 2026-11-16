'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Leaf } from 'lucide-react'

import { ActionButton } from '@/components/button/action-button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { StatusBadge } from '@/components/shared/data-badge'

import type { CommodityRecord } from '@/types/scm/commodity'

export interface CommodityColumnsProps {
  t: (key: string, values?: Record<string, string | number>) => string
  onView: (item: CommodityRecord) => void
  onEdit: (item: CommodityRecord) => void
  onDelete: (item: CommodityRecord) => void
}

export function getCommodityColumns({ t, onView, onEdit, onDelete }: CommodityColumnsProps): ColumnDef<CommodityRecord>[] {
  return [
    {
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.code')} />,
      cell: ({ row }) => <span className="text-primary font-mono text-xs font-semibold">{row.original.code}</span>,
      enableSorting: true
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.name')} />,
      cell: ({ row }) => <span className="text-foreground text-xs font-medium">{row.original.name}</span>,
      enableSorting: true
    },
    {
      accessorKey: 'latinName',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.latinName')} />,
      cell: ({ row }) => <span className="text-muted-foreground text-xs italic">{row.original.latinName || '—'}</span>,
      enableSorting: false
    },
    {
      accessorKey: 'plantPart',
      header: () => <span className="text-xs">{t('table.columns.plantPart')}</span>,
      cell: ({ row }) => (
        <StatusBadge variant="info">
          <Leaf className="mr-1 size-3" />
          {t(`plantParts.${row.original.plantPart}`)}
        </StatusBadge>
      ),
      enableSorting: false
    },
    {
      accessorKey: 'cultivationStatus',
      header: () => <span className="text-xs">{t('table.columns.cultivationStatus')}</span>,
      cell: ({ row }) => (
        <StatusBadge variant={row.original.cultivationStatus === 'wild' ? 'warning' : 'success'}>
          {t(`cultivationStatuses.${row.original.cultivationStatus}`)}
        </StatusBadge>
      ),
      enableSorting: false
    },
    {
      accessorKey: 'harvestSeason',
      header: () => <span className="text-xs">{t('table.columns.harvestSeason')}</span>,
      cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.harvestSeason || '—'}</span>,
      enableSorting: false
    },
    {
      accessorKey: 'active',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.status')} />,
      cell: ({ row }) => (
        <StatusBadge variant={row.original.active ? 'success' : 'neutral'}>
          {row.original.active ? t('table.status.active') : t('table.status.inactive')}
        </StatusBadge>
      ),
      enableSorting: false
    },
    {
      id: 'actions',
      header: () => <div className="text-center text-xs">{t('table.columns.actions')}</div>,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center justify-center gap-1">
            <ActionButton variant="view" label={t('actions.view')} onClick={() => onView(item)} />
            <ActionButton variant="edit" label={t('actions.edit')} onClick={() => onEdit(item)} />
            <ActionButton variant="delete" label={t('actions.delete')} onClick={() => onDelete(item)} />
          </div>
        )
      }
    }
  ]
}
