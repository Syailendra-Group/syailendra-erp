'use client'

import { useMemo } from 'react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { ActionButton } from '@/components/button/action-button'
import { DataTableLoadingOverlay, DataTablePagination, DataTableSkeleton, DataTableToolbar } from '@/components/data-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDepartment } from '@/contexts/hris/department.context'
import { useDepartmentsPaginatedQuery, useToggleDepartmentStatusMutation } from '@/hooks/hris/use-departments'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'
import { cn } from '@/lib/utils'

import type { DepartmentRecord } from '@/types/hris/department'
import type { ColumnDef } from '@tanstack/react-table'
import type { ReactElement } from 'react'

const FILTER_KEYS = ['active']

export function DepartmentsTable(): ReactElement {
  const tAdmin = useTranslations('admin.departments')
  const tCommon = useTranslations('common')
  const { setOpen, setCurrentRow, currentRow, open } = useDepartment()
  const { mutateAsync: toggleStatus, isPending: isToggling } = useToggleDepartmentStatusMutation()

  const {
    page,
    perPage,
    search,
    orderOdoo,
    pagination,
    sorting,
    columnFilters,
    getArrayFilter,
    isUpdating,
    resetFilters,
    onPaginationChange,
    onSortingChange,
    onGlobalFilterChange,
    createColumnFiltersHandler
  } = useDataTableUrlState({
    defaultSort: 'name.asc',
    filterKeys: FILTER_KEYS
  })

  const statusList = getArrayFilter('active')

  const {
    data: result,
    isLoading,
    isFetching
  } = useDepartmentsPaginatedQuery({
    page,
    perPage,
    search,
    status: statusList.length > 0 ? statusList : undefined,
    order: orderOdoo
  })

  const departments = result?.records ?? []
  const totalCount = result?.totalCount ?? 0

  const handleToggle = async (item: DepartmentRecord) => {
    await toggleStatus({ id: item.id, active: !item.active })
    setOpen(null)
  }

  const columns = useMemo<ColumnDef<DepartmentRecord>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title={tAdmin('fields.name')} />,
        cell: ({ row }) => <span className="text-foreground text-xs font-semibold sm:text-sm">{row.original.name}</span>,
        enableSorting: true
      },
      {
        accessorKey: 'active',
        header: ({ column }) => <DataTableColumnHeader column={column} title={tCommon('status.loading')} />,
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
            <ActionButton
              variant="edit"
              label={tCommon('actions.edit')}
              onClick={() => {
                setCurrentRow(row.original)
                setOpen('edit')
              }}
            />
            <ActionButton
              variant={row.original.active ? 'archive' : 'restore'}
              label={row.original.active ? tCommon('actions.archive') : tCommon('actions.restore')}
              onClick={() => {
                setCurrentRow(row.original)
                setOpen(row.original.active ? 'archive' : 'restore')
              }}
            />
          </div>
        )
      }
    ],
    [tAdmin, tCommon, setCurrentRow, setOpen]
  )

  const table = useReactTable({
    data: departments,
    columns,
    rowCount: totalCount,
    state: {
      pagination,
      sorting,
      columnFilters,
      globalFilter: search
    },
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange: createColumnFiltersHandler(FILTER_KEYS),
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel()
  })

  const statusFilterOptions = useMemo(
    () => [
      { label: tCommon('status.active'), value: 'active' },
      { label: tCommon('status.archived'), value: 'archived' }
    ],
    [tCommon]
  )

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder={tCommon('actions.search')}
        onReset={resetFilters}
        filters={[
          {
            columnId: 'active',
            title: tCommon('status.loading'),
            options: statusFilterOptions
          }
        ]}
      />

      <div className="bg-card relative overflow-hidden rounded-md border shadow-xs">
        <DataTableLoadingOverlay isUpdating={isUpdating} text={tCommon('status.loading')} />
        <div className="overflow-x-auto">
          {isLoading || isFetching ? (
            <DataTableSkeleton columnCount={columns.length} rowCount={perPage} />
          ) : (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className={cn('text-xs font-semibold', header.column.id === 'actions' && 'text-center')}
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/30 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-2.5 text-xs">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
          )}
        </div>
      </div>

      <DataTablePagination table={table} />

      <ConfirmDialog
        open={open === 'archive' || open === 'restore'}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        title={open === 'archive' ? tAdmin('confirm.archiveTitle') : tAdmin('confirm.restoreTitle')}
        desc={
          open === 'archive'
            ? tAdmin('confirm.archiveDesc', { name: currentRow?.name || '' })
            : tAdmin('confirm.restoreDesc', { name: currentRow?.name || '' })
        }
        confirmText={open === 'archive' ? tCommon('actions.archive') : tCommon('actions.restore')}
        destructive={open === 'archive'}
        isLoading={isToggling}
        handleConfirm={() => currentRow && handleToggle(currentRow)}
      />
    </div>
  )
}
