'use client'

import { useMemo } from 'react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTablePagination, DataTableSkeleton, DataTableToolbar } from '@/components/data-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useCountry } from '@/contexts/others/country.context'
import { useCountriesPaginatedQuery } from '@/hooks/others/use-countries'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'
import { cn } from '@/lib/utils'

import { getColumns } from './columns'

import type { CountryRecord } from '@/types/others/country'
import type { ReactElement } from 'react'

export function CountriesTable(): ReactElement {
  const t = useTranslations('regional.countries')
  const tCommon = useTranslations('common')
  const { setOpen, setCurrentRow } = useCountry()

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
  } = useCountriesPaginatedQuery({
    page,
    perPage,
    search,
    order: orderOdoo
  })

  const countries = result?.records ?? []
  const totalCount = result?.totalCount ?? 0

  const columns = useMemo(
    () =>
      getColumns({
        t,
        tCommon,
        onView: (country: CountryRecord) => {
          setCurrentRow(country)
          setOpen('view')
        },
        onEdit: (country: CountryRecord) => {
          setCurrentRow(country)
          setOpen('edit')
        },
        onDelete: (country: CountryRecord) => {
          setCurrentRow(country)
          setOpen('delete')
        }
      }),
    [t, tCommon, setCurrentRow, setOpen]
  )

  // 3. TanStack Table Instance
  const table = useReactTable({
    data: countries,
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

  const showSkeleton = isLoading || (isFetching && countries.length === 0)
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
