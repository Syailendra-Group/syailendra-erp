'use client'

import { useMemo } from 'react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTableLoadingOverlay, DataTablePagination, DataTableSkeleton, DataTableToolbar } from '@/components/data-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDistillers } from '@/contexts/scm/distiller.context'
import { useDistillersPaginatedQuery } from '@/hooks/scm/use-distillers'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'
import { cn } from '@/lib/utils'

import { getColumns } from './columns'

import type { ReactElement } from 'react'

const FILTER_KEYS = ['method', 'active']

export function DistillersTable(): ReactElement {
  const tTrace = useTranslations('traceability')
  const tCommon = useTranslations('common')

  const { setOpen, setCurrentRow } = useDistillers()

  const columns = useMemo(
    () =>
      getColumns({
        tTrace,
        tCommon,
        onView: (item) => {
          setCurrentRow(item)
          setOpen('view')
        },
        onEdit: (item) => {
          setCurrentRow(item)
          setOpen('edit')
        },
        onDelete: (item) => {
          setCurrentRow(item)
          setOpen('archive')
        }
      }),
    [tTrace, tCommon, setCurrentRow, setOpen]
  )

  // 1. Hook manages all URL parsing, pagination, sorting & filter state
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
    defaultSort: 'ref.asc',
    filterKeys: FILTER_KEYS
  })

  // 2. Extracted array filter values from URL
  const methodList = getArrayFilter('method')
  const statusList = getArrayFilter('active')

  // 3. TanStack Query with server-side pagination & filter params
  const {
    data: result,
    isLoading,
    isFetching
  } = useDistillersPaginatedQuery({
    page,
    perPage,
    search,
    method: methodList.length > 0 ? methodList : undefined,
    status: statusList.length > 0 ? statusList : undefined,
    order: orderOdoo
  })

  const distillers = result?.records ?? []
  const totalCount = result?.totalCount ?? 0

  const table = useReactTable({
    data: distillers,
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

  const methodFilterOptions = useMemo(
    () => [
      { label: tTrace('distillers.methods.steam'), value: 'steam' },
      { label: tTrace('distillers.methods.hydro'), value: 'hydro' },
      { label: tTrace('distillers.methods.water_steam'), value: 'water_steam' },
      { label: tTrace('distillers.methods.cold_pressed'), value: 'cold_pressed' }
    ],
    [tTrace]
  )

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
            columnId: 'method',
            title: tTrace('distillers.table.method'),
            options: methodFilterOptions
          },
          {
            columnId: 'active',
            title: tTrace('distillers.table.status'),
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
