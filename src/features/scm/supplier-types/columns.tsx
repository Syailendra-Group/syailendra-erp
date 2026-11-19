/**
 * columns.tsx — Supplier Types columns (flat master, sequence-ordered)
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Hash, Users } from 'lucide-react'

import { ActionButton } from '@/components/button/action-button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { StatusBadge } from '@/components/shared/data-badge'
import { IconText, LongText, PrimaryText } from '@/components/text'
import { Badge } from '@/components/ui/badge'

import type { SupplierTypeRecord } from '@/types/scm/supplier-type'

export interface SupplierTypeColumnsProps {
  t: (key: string, values?: Record<string, string | number>) => string
  tCommon: (key: string) => string
  onView: (item: SupplierTypeRecord) => void
  onEdit: (item: SupplierTypeRecord) => void
  onToggleStatus: (item: SupplierTypeRecord) => void
}

export function getSupplierTypeColumns({ t, tCommon, onView, onEdit, onToggleStatus }: SupplierTypeColumnsProps): ColumnDef<SupplierTypeRecord>[] {
  return [
    {
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.code')} />,
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-[11px]">
          {row.original.code}
        </Badge>
      ),
      enableSorting: true
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.name')} />,
      cell: ({ row }) => (
        <div className="flex max-w-60 items-center gap-2">
          <PrimaryText bold={true} className="text-xs">
            <LongText>{row.original.name}</LongText>
          </PrimaryText>
        </div>
      ),
      enableSorting: true
    },
    {
      accessorKey: 'description',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.description')} />,
      cell: ({ row }) => {
        const description = row.original.description
        if (!description) return <span className="text-muted-foreground text-xs">-</span>
        return (
          <div className="max-w-80">
            <LongText className="text-muted-foreground text-xs">{description}</LongText>
          </div>
        )
      },
      enableSorting: false
    },
    {
      accessorKey: 'supplierCount',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.supplierCount')} />,
      cell: ({ row }) => (
        <IconText icon={Users} mono className="text-muted-foreground">
          {t('table.supplierCountFormat', { count: row.original.supplierCount })}
        </IconText>
      ),
      enableSorting: false
    },
    {
      accessorKey: 'sequence',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.sequence')} />,
      cell: ({ row }) => (
        <IconText icon={Hash} mono className="text-muted-foreground">
          {row.original.sequence}
        </IconText>
      ),
      enableSorting: true
    },
    {
      accessorKey: 'active',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.status')} />,
      cell: ({ row }) => {
        const active = row.original.active
        return (
          <StatusBadge variant={active ? 'success' : 'neutral'} size="sm">
            {active ? tCommon('status.active') : tCommon('status.inactive')}
          </StatusBadge>
        )
      },
      enableSorting: true
    },
    {
      id: 'actions',
      header: () => <div className="text-center">{t('table.columns.actions')}</div>,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center justify-center gap-1">
            <ActionButton variant="view" label={t('actions.view')} onClick={() => onView(item)} />
            <ActionButton variant="edit" label={t('actions.edit')} onClick={() => onEdit(item)} />
            <ActionButton
              variant={item.active ? 'archive' : 'restore'}
              label={item.active ? t('actions.archive') : t('actions.restore')}
              onClick={() => onToggleStatus(item)}
            />
          </div>
        )
      }
    }
  ]
}
