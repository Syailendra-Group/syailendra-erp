'use client'

import { useMemo } from 'react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTablePagination, DataTableSkeleton, DataTableToolbar } from '@/components/data-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getColumns } from '@/features/traceability/farmers/columns'
import { useFarmersPaginatedQuery } from '@/hooks/traceability/use-farmers'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'
import { cn } from '@/lib/utils'

import type { ReactElement } from 'react'

const FILTER_KEYS = ['commodity', 'active']

export function FarmersTable(): ReactElement {
  const tTrace = useTranslations('traceability.farmers')
  const tCommon = useTranslations('common')

  const columns = useMemo(() => getColumns({ tTrace, tCommon }), [tTrace, tCommon])

  // Hook manages all URL parsing, pagination, sorting & filter state
  const {
    page,
    perPage,
    search,
    orderOdoo,
    pagination,
    sorting,
    columnFilters,
    isUpdating,
    getArrayFilter,
    resetFilters,
    onPaginationChange,
    onSortingChange,
    onGlobalFilterChange,
    createColumnFiltersHandler
  } = useDataTableUrlState({
    defaultSort: 'ref.asc',
    filterKeys: FILTER_KEYS
  })

  // Fetch paginated data from Odoo via TanStack Query using URL state
  const commodityList = getArrayFilter('commodity')
  const statusList = getArrayFilter('status')

  const {
    data: result,
    isLoading,
    isFetching
  } = useFarmersPaginatedQuery({
    page,
    perPage,
    search,
    commodity: commodityList.length > 0 ? commodityList : undefined,
    status: statusList.length > 0 ? statusList : undefined,
    order: orderOdoo
  })

  const farmers = result?.records ?? []
  const totalCount = result?.totalCount ?? 0

  // Clean TanStack Table instance wiring
  const table = useReactTable({
    data: farmers,
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
    onColumnFiltersChange: createColumnFiltersHandler(FILTER_KEYS),
    getCoreRowModel: getCoreRowModel()
  })

  // Faceted Filter Options
  const commodityFilterOptions = useMemo(
    () => [
      { label: tTrace('commodities.gaharu'), value: 'gaharu' },
      { label: tTrace('commodities.nilam'), value: 'nilam' },
      { label: tTrace('commodities.serai'), value: 'serai' },
      { label: tTrace('commodities.kopi'), value: 'kopi' },
      { label: tTrace('commodities.cengkeh'), value: 'cengkeh' }
    ],
    [tTrace]
  )

  const statusFilterOptions = useMemo(
    () => [
      { label: tCommon('status.active'), value: 'true' },
      { label: tCommon('status.archived'), value: 'false' }
    ],
    [tCommon]
  )

  const showSkeleton = isLoading || (isFetching && farmers.length === 0)
  const isTableRefreshing = isFetching || isUpdating

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder={tCommon('actions.search')}
        onReset={resetFilters}
        filters={[
          {
            columnId: 'commodity',
            title: tTrace('table.commodity'),
            options: commodityFilterOptions
          },
          {
            columnId: 'active',
            title: tTrace('table.status'),
            options: statusFilterOptions
          }
        ]}
      />

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
