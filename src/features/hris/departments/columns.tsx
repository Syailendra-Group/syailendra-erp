'use client'

import { ActionButton } from '@/components/button/action-button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { StatusBadge } from '@/components/shared/data-badge'

import type { DepartmentRecord } from '@/types/hris/department'
import type { ColumnDef } from '@tanstack/react-table'

export interface GetColumnsOptions {
  tAdmin: (key: string) => string
  tCommon: (key: string) => string
  onView?: (item: DepartmentRecord) => void
  onEdit?: (item: DepartmentRecord) => void
  onDelete?: (item: DepartmentRecord) => void
}

export function getColumns({ tAdmin, tCommon, onView, onEdit, onDelete }: GetColumnsOptions): ColumnDef<DepartmentRecord>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tAdmin('fields.name')} />,
      cell: ({ row }) => <span className="text-foreground text-xs font-semibold sm:text-sm">{row.original.name}</span>,
      enableSorting: true
    },
    {
      accessorKey: 'active',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tAdmin('fields.status')} />,
      cell: ({ row }) => {
        const active = row.original.active
        return <StatusBadge variant={active ? 'success' : 'warning'}>{active ? tCommon('status.active') : tCommon('status.archived')}</StatusBadge>
      }
    },
    {
      id: 'actions',
      header: () => <div className="text-center text-xs">{tCommon('table.actions')}</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <ActionButton variant="view" label={tCommon('actions.view')} onClick={() => onView?.(row.original)} />
          <ActionButton variant="edit" label={tCommon('actions.edit')} onClick={() => onEdit?.(row.original)} />
          <ActionButton
            variant={row.original.active ? 'archive' : 'restore'}
            label={row.original.active ? tCommon('actions.archive') : tCommon('actions.restore')}
            onClick={() => onDelete?.(row.original)}
          />
        </div>
      )
    }
  ]
}
