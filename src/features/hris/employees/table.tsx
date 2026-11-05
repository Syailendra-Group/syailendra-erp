'use client'

import { useMemo } from 'react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTableLoadingOverlay, DataTablePagination, DataTableSkeleton, DataTableToolbar } from '@/components/data-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDepartmentOptionsQuery, useEmployeesPaginatedQuery } from '@/hooks/hris/use-employees'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'
import { cn } from '@/lib/utils'

import { getColumns } from './columns'

import type { ReactElement } from 'react'

const FILTER_KEYS = ['department', 'active']

export function EmployeesTable(): ReactElement {
  const tAdmin = useTranslations('admin.employees')
  const tCommon = useTranslations('common')

  const { data: deptOptions = [] } = useDepartmentOptionsQuery()

  const columns = useMemo(() => getColumns({ tAdmin, tCommon }), [tAdmin, tCommon])

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

  const deptList = getArrayFilter('department')
  const statusList = getArrayFilter('active')

  const {
    data: result,
    isLoading,
    isFetching
  } = useEmployeesPaginatedQuery({
    page,
    perPage,
    search,
    departmentId: deptList.length > 0 ? deptList : undefined,
    status: statusList.length > 0 ? statusList : undefined,
    order: orderOdoo
  })

  const employees = result?.records ?? []
  const totalCount = result?.totalCount ?? 0

  const table = useReactTable({
    data: employees,
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

  const departmentFilterOptions = useMemo(() => deptOptions.map((d) => ({ label: d.name, value: String(d.id) })), [deptOptions])

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
            columnId: 'department',
            title: tAdmin('table.department'),
            options: departmentFilterOptions
          },
          {
            columnId: 'active',
            title: tAdmin('table.status'),
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
    </div>
  )
}
