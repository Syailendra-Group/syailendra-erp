'use client'

import { useState } from 'react'
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ActionButton } from '@/components/button/action-button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { DataTablePagination } from '@/components/data-table/pagination'
import { StatusBadge } from '@/components/shared/status-badge'
import { LongText } from '@/components/text/long-text'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToggleDepartmentStatusMutation } from '@/hooks/hris/use-departments'

import type { DepartmentRecord } from '@/actions/hris/department.action'
import type { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from '@tanstack/react-table'
import type { ReactElement } from 'react'

export interface DepartmentsTableProps {
  data: DepartmentRecord[]
  onEdit: (row: DepartmentRecord) => void
  onRefresh: () => void
}

export function DepartmentsTable({ data, onEdit, onRefresh }: DepartmentsTableProps): ReactElement {
  const tAdmin = useTranslations('admin.departments')
  const tCommon = useTranslations('common')

  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [archiveTarget, setArchiveTarget] = useState<DepartmentRecord | null>(null)
  const { mutateAsync: toggleDepartmentStatus, isPending: isArchiving } = useToggleDepartmentStatusMutation()

  const handleToggleStatus = async () => {
    if (!archiveTarget) return
    const nextStatus = !archiveTarget.active
    try {
      const res = await toggleDepartmentStatus({ id: archiveTarget.id, active: nextStatus })
      if (res.success) {
        toast.success(nextStatus ? tAdmin('messages.restored') : tAdmin('messages.archived'))
        setArchiveTarget(null)
        onRefresh()
      } else {
        toast.error(res.error || tCommon('status.error'))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : tCommon('status.error')
      toast.error(msg)
    }
  }

  const columns: ColumnDef<DepartmentRecord>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tAdmin('fields.name')} />,
      cell: ({ row }) => <LongText className="max-w-[280px] text-xs font-semibold">{row.getValue('name')}</LongText>
    },
    {
      accessorKey: 'active',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const active = row.getValue('active') as boolean
        return <StatusBadge variant={active ? 'success' : 'neutral'}>{active ? tCommon('status.active') : tCommon('status.archived')}</StatusBadge>
      }
    },
    {
      id: 'actions',
      header: () => <div className="text-center text-xs font-semibold">{tCommon('table.actions')}</div>,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center justify-center gap-1">
            <ActionButton variant="edit" label={tCommon('actions.edit')} onClick={() => onEdit(item)} />
            <ActionButton
              variant={item.active ? 'archive' : 'restore'}
              label={item.active ? tCommon('actions.archive') : tCommon('actions.restore')}
              onClick={() => setArchiveTarget(item)}
            />
          </div>
        )
      }
    }
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  })

  return (
    <div className="space-y-4">
      <div className="border-border/60 bg-card overflow-hidden rounded-md border shadow-xs">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header instanceof Function
                        ? header.column.columnDef.header(header.getContext())
                        : header.column.columnDef.header}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.column.columnDef.cell instanceof Function ? cell.column.columnDef.cell(cell.getContext()) : (cell.getValue() as string)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center text-xs">
                  {tCommon('table.noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onOpenChange={(v) => {
          if (!v) setArchiveTarget(null)
        }}
        handleConfirm={handleToggleStatus}
        isLoading={isArchiving}
        title={archiveTarget?.active ? tAdmin('confirm.archiveTitle') : tAdmin('confirm.restoreTitle')}
        desc={
          archiveTarget?.active
            ? tAdmin('confirm.archiveDesc', { name: archiveTarget?.name || '' })
            : tAdmin('confirm.restoreDesc', { name: archiveTarget?.name || '' })
        }
        confirmText={archiveTarget?.active ? tCommon('actions.archive') : tCommon('actions.restore')}
        destructive={archiveTarget?.active}
      />
    </div>
  )
}
