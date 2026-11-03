'use client'

import { useMemo } from 'react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTablePagination, DataTableSkeleton, DataTableToolbar } from '@/components/data-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useProvince } from '@/contexts/others/province.context'
import { useProvincesPaginatedQuery } from '@/hooks/others/use-provinces'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'
import { cn } from '@/lib/utils'

import { getColumns } from './columns'

import type { ProvinceRecord } from '@/types/others/province'
import type { ReactElement } from 'react'

export function ProvincesTable(): ReactElement {
  const t = useTranslations('regional.provinces')
  const tCommon = useTranslations('common')
  const { setOpen, setCurrentRow } = useProvince()

  // 1. Manage URL SearchParams & Table State adapters via reusable hook
  const {
    page,
    perPage,
    search,
    orderOdoo,
    pagination,
    sorting,
    columnFilters,
    isUpdating,
    resetFilters,
    onPaginationChange,
    onSortingChange,
    onGlobalFilterChange,
    createColumnFiltersHandler
  } = useDataTableUrlState({
    defaultSort: 'name.asc',
    filterKeys: []
  })

  // 2. Fetch paginated data from Odoo
  const {
    data: result,
    isLoading,
    isFetching
  } = useProvincesPaginatedQuery({
    page,
    perPage,
    search,
    order: orderOdoo
  })

  const provinces = result?.records ?? []
  const totalCount = result?.totalCount ?? 0

  const columns = useMemo(
    () =>
      getColumns({
        t,
        tCommon,
        onEdit: (prov: ProvinceRecord) => {
          setCurrentRow(prov)
          setOpen('edit')
        }
      }),
    [t, tCommon, setCurrentRow, setOpen]
  )

  // 3. TanStack Table Instance
  const table = useReactTable({
    data: provinces,
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
    onGlobalFilterChange,
    onColumnFiltersChange: createColumnFiltersHandler([]),
    getCoreRowModel: getCoreRowModel()
  })

  const showSkeleton = isLoading || (isFetching && provinces.length === 0)
  const isTableRefreshing = isFetching || isUpdating

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} searchPlaceholder={tCommon('actions.search')} onReset={resetFilters} />

      <div className="bg-card relative overflow-hidden rounded-md border-0 shadow-xs">
        {isTableRefreshing && !showSkeleton && (
          <div className="bg-primary/20 absolute top-0 right-0 left-0 z-20 h-0.5 overflow-hidden">
            <div className="bg-primary h-full w-full animate-pulse" />
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan} className={cn('text-xs', header.column.id === 'actions' && 'text-center')}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            {showSkeleton ? (
              <DataTableSkeleton columnCount={columns.length} rowCount={8} />
            ) : (
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
            )}
          </Table>
        </div>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
