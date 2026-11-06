/**
 * columns.tsx — Standardized TanStack Table columns for Material Master
 * Syailendra Group ERP (SCM Pillar)
 * Complies with octadev-coding-rules-v84
 */

'use client'

import { ColumnDef } from '@tanstack/react-table'

import { ActionButton } from '@/components/button/action-button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { LongText, PrimaryText } from '@/components/text'
import { Badge } from '@/components/ui/badge'

import type { MaterialRecord } from '@/types/scm/material'

export interface GetColumnsOptions {
  t: (key: string, values?: Record<string, string | number>) => string
  tCommon: (key: string) => string
  onView: (item: MaterialRecord) => void
  onEdit: (item: MaterialRecord) => void
  onToggleStatus?: (item: MaterialRecord) => void
  onDelete?: (item: MaterialRecord) => void
}

export function getColumns({ t, tCommon, onView, onEdit, onToggleStatus, onDelete }: GetColumnsOptions): ColumnDef<MaterialRecord>[] {
  return [
    {
      accessorKey: 'default_code',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.code')} />,
      cell: ({ row }) => <PrimaryText fallback="-">{row.original.default_code}</PrimaryText>,
      enableSorting: true
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.product')} />,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex max-w-[220px] flex-col gap-0.5">
            <span className="text-xs font-semibold tracking-tight">
              <LongText>{item.name}</LongText>
            </span>
            {item.botanical_name && (
              <span className="text-muted-foreground text-[10px] italic">
                <LongText>{item.botanical_name}</LongText>
              </span>
            )}
          </div>
        )
      },
      enableSorting: true
    },
    {
      accessorKey: 'category',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.category')} />,
      cell: ({ row }) => (
        <Badge variant="outline" className="max-w-[160px] text-[10px] font-normal">
          <LongText>{row.original.category}</LongText>
        </Badge>
      )
    },
    {
      accessorKey: 'uom_id',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.uom')} />,
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-xs font-medium">{row.original.uom_id ? row.original.uom_id[1] : '-'}</span>
      )
    },
    {
      accessorKey: 'tracking',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.tracking')} />,
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-mono text-[10px] uppercase">
          {row.original.tracking}
        </Badge>
      )
    },
    {
      accessorKey: 'active',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.statusLabel') || 'Status'} />,
      cell: ({ row }) => {
        const active = row.original.active
        return (
          <StatusBadge variant={active ? 'success' : 'neutral'} size="sm">
            {active ? t('table.status.active') : t('table.status.archived')}
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
            <ActionButton variant="view" label={tCommon('actions.view')} onClick={() => onView(item)} />
            <ActionButton variant="edit" label={tCommon('actions.edit')} onClick={() => onEdit(item)} />
            <ActionButton
              variant={item.active ? 'archive' : 'restore'}
              label={item.active ? tCommon('actions.archive') : tCommon('actions.restore')}
              onClick={() => (onToggleStatus ? onToggleStatus(item) : onDelete ? onDelete(item) : undefined)}
            />
          </div>
        )
      }
    }
  ]
}
