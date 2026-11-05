/**
 * columns.tsx — TanStack Table v8 columns for Material Master
 * Syailendra Group ERP — SCM Pillar
 */

'use client'

import { ActionButton } from '@/components/button/action-button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { Badge } from '@/components/ui/badge'

import type { MaterialRecord } from '@/types/scm/material'
import type { ColumnDef } from '@tanstack/react-table'

export interface GetColumnsOptions {
  t: (key: string) => string
  tCommon: (key: string) => string
  onView: (material: MaterialRecord) => void
  onEdit: (material: MaterialRecord) => void
  onDelete: (material: MaterialRecord) => void
}

export function getColumns({ t, tCommon, onView, onEdit, onDelete }: GetColumnsOptions): ColumnDef<MaterialRecord>[] {
  return [
    {
      accessorKey: 'default_code',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.code')} />,
      cell: ({ row }) => <span className="text-primary font-mono text-xs font-bold tracking-tight">{row.original.default_code || '-'}</span>,
      enableSorting: true
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.product')} />,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-foreground text-xs font-semibold sm:text-sm">{item.name}</span>
            {item.botanical_name && <span className="text-muted-foreground text-[11px] tracking-tight italic">{item.botanical_name}</span>}
          </div>
        )
      },
      enableSorting: true
    },
    {
      accessorKey: 'category',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.category')} />,
      cell: ({ row }) => {
        const cat = row.original.category
        let badgeVariant: 'default' | 'secondary' | 'outline' = 'secondary'
        if (cat === 'essential_oils') badgeVariant = 'default'
        if (cat === 'raw_biomass') badgeVariant = 'outline'

        return (
          <Badge variant={badgeVariant} className="text-[11px] font-medium capitalize">
            {t(`categories.${cat}`)}
          </Badge>
        )
      },
      enableSorting: true
    },
    {
      accessorKey: 'uom_id',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.uom')} />,
      cell: ({ row }) => {
        const uom = row.original.uom_id
        return <span className="text-muted-foreground font-mono text-xs font-medium">{uom ? uom[1] : '-'}</span>
      },
      enableSorting: false
    },
    {
      accessorKey: 'shelf_life_months',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.shelfLife')} />,
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-xs font-medium">
          {row.original.shelf_life_months ? `${row.original.shelf_life_months} mo` : '-'}
        </span>
      ),
      enableSorting: true
    },
    {
      accessorKey: 'tracking',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.tracking')} />,
      cell: ({ row }) => {
        const tracking = row.original.tracking
        return (
          <Badge variant={tracking === 'lot' ? 'default' : 'outline'} className="font-mono text-[10px] uppercase">
            {t(`trackingOptions.${tracking}`)}
          </Badge>
        )
      },
      enableSorting: true
    },
    {
      id: 'actions',
      header: () => <div className="text-center text-xs font-semibold">{tCommon('table.actions')}</div>,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center justify-center gap-1">
            <ActionButton variant="view" label={tCommon('actions.view')} onClick={() => onView(item)} />
            <ActionButton variant="edit" label={tCommon('actions.edit')} onClick={() => onEdit(item)} />
            <ActionButton variant="delete" label={tCommon('actions.delete')} onClick={() => onDelete(item)} />
          </div>
        )
      }
    }
  ]
}
