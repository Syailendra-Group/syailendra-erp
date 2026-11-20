/**
 * columns.tsx — Supplier Categories columns (procurement grouping hierarchy)
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { ColumnDef } from '@tanstack/react-table'
import { CornerDownRight, FolderTree, Tag, Users } from 'lucide-react'

import { ActionButton } from '@/components/button/action-button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { StatusBadge } from '@/components/shared/data-badge'
import { IconText, LongText, PrimaryText } from '@/components/text'
import { Badge } from '@/components/ui/badge'

import type { SupplierCategoryRecord } from '@/types/scm/supplier-category'

export interface SupplierCategoryColumnsProps {
  t: (key: string, values?: Record<string, string | number>) => string
  tCommon: (key: string) => string
  onView: (item: SupplierCategoryRecord) => void
  onEdit: (item: SupplierCategoryRecord) => void
  onDelete: (item: SupplierCategoryRecord) => void
}

const BADGE_COLORS = [
  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
]

export function getSupplierCategoryColumns({
  t,
  tCommon,
  onView,
  onEdit,
  onDelete
}: SupplierCategoryColumnsProps): ColumnDef<SupplierCategoryRecord>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.name')} />,
      cell: ({ row }) => {
        const item = row.original
        if (item.depth === 0) {
          return (
            <div className="flex max-w-65 items-center gap-2">
              <FolderTree className="text-primary h-4 w-4 shrink-0" />
              <PrimaryText bold={true} className="max-w-45 text-xs">
                <LongText>{item.name}</LongText>
              </PrimaryText>
            </div>
          )
        }

        return (
          <div className="flex max-w-65 items-center gap-1.5" style={{ paddingLeft: `${Math.min(item.depth, 4) * 14}px` }}>
            <CornerDownRight className="text-muted-foreground/60 h-3.5 w-3.5 shrink-0" />
            <Tag className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
            <span className="text-foreground max-w-40 truncate text-xs font-normal">
              <LongText>{item.name}</LongText>
            </span>
          </div>
        )
      },
      enableSorting: true
    },
    {
      accessorKey: 'parentName',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.parent')} />,
      cell: ({ row }) => {
        const item = row.original
        if (item.depth === 0) {
          return (
            <Badge variant="outline" className="text-muted-foreground text-[10px]">
              {t('table.rootType')}
            </Badge>
          )
        }
        return (
          <Badge variant="secondary" className="max-w-40 text-[10px] font-normal">
            <LongText>{item.parentName || '-'}</LongText>
          </Badge>
        )
      }
    },
    {
      accessorKey: 'color',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.color')} />,
      cell: ({ row }) => {
        const colorIdx = row.original.color % BADGE_COLORS.length
        return <Badge className={`border-0 text-[10px] font-normal ${BADGE_COLORS[colorIdx]}`}>Tag #{row.original.color}</Badge>
      }
    },
    {
      accessorKey: 'supplierCount',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.supplierCount')} />,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-1.5">
            <IconText icon={Users} mono className="text-muted-foreground">
              {t('table.supplierCountFormat', { count: item.supplierCount })}
            </IconText>
            {item.childCount > 0 && (
              <Badge variant="outline" className="text-muted-foreground px-1.5 py-0 text-[10px] font-normal">
                {t('table.childCount', { count: item.childCount })}
              </Badge>
            )}
          </div>
        )
      },
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
            <ActionButton variant="delete" label={t('actions.delete')} onClick={() => onDelete(item)} />
          </div>
        )
      }
    }
  ]
}
