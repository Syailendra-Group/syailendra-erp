'use client'

import { useMemo } from 'react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTableLoadingOverlay, DataTablePagination, DataTableSkeleton, DataTableToolbar } from '@/components/data-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDistrict } from '@/contexts/others/district.context'
import { useDistrictFilterOptionsQuery, useDistrictsPaginatedQuery } from '@/hooks/others/use-districts'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'
import { cn } from '@/lib/utils'

import { getColumns } from './columns'

import type { DistrictRecord } from '@/types/others/district'
import type { ReactElement } from 'react'

const FILTER_KEYS = ['scope', 'country', 'province', 'city']

export function DistrictsTable(): ReactElement {
  const t = useTranslations('others.districts')
  const tCommon = useTranslations('common')
  const tReg = useTranslations('regional.common')
  const { setOpen, setCurrentRow } = useDistrict()

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
    defaultSort: 'name.asc',
    filterKeys: FILTER_KEYS
  })

  const { data: filterOptions } = useDistrictFilterOptionsQuery()

  const scopeFilter = getArrayFilter('scope')
  const countryFilter = getArrayFilter('country')
  const provinceFilter = getArrayFilter('province')
  const cityFilter = getArrayFilter('city')

  const {
    data: result,
    isLoading,
    isFetching
  } = useDistrictsPaginatedQuery({
    page,
    perPage,
    search,
    scope: scopeFilter.length > 0 ? scopeFilter : undefined,
    countryId: countryFilter.length > 0 ? countryFilter : undefined,
    stateId: provinceFilter.length > 0 ? provinceFilter : undefined,
    cityId: cityFilter.length > 0 ? cityFilter : undefined,
    order: orderOdoo
  })

  const records = result?.records ?? []
  const totalCount = result?.totalCount ?? 0

  const columns = useMemo(
    () =>
      getColumns({
        t,
        tCommon,
        onView: (item: DistrictRecord) => {
          setCurrentRow(item)
          setOpen('view')
        },
        onEdit: (item: DistrictRecord) => {
          setCurrentRow(item)
          setOpen('edit')
        },
        onDelete: (item: DistrictRecord) => {
          setCurrentRow(item)
          setOpen('delete')
        }
      }),
    [t, tCommon, setCurrentRow, setOpen]
  )

  const table = useReactTable({
    data: records,
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

  const scopeOptions = useMemo(
    () => [
      { label: tReg('domestic'), value: 'domestic' },
      { label: tReg('international'), value: 'foreign' }
    ],
    [tReg]
  )

  const countryFilterOptions = useMemo(
    () => (filterOptions?.countries || []).map((c) => ({ label: c.name, value: String(c.id) })),
    [filterOptions?.countries]
  )

  const provinceFilterOptions = useMemo(
    () => (filterOptions?.states || []).map((s) => ({ label: s.name, value: String(s.id) })),
    [filterOptions?.states]
  )

  const cityFilterOptions = useMemo(() => (filterOptions?.cities || []).map((c) => ({ label: c.name, value: String(c.id) })), [filterOptions?.cities])

  const showSkeleton = isLoading || (isFetching && records.length === 0)

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder={tCommon('actions.search')}
        onReset={resetFilters}
        filters={[
          {
            columnId: 'scope',
            title: tReg('category'),
            options: scopeOptions
          },
          ...(countryFilterOptions.length > 0 ? [{ columnId: 'country', title: tReg('fields.country'), options: countryFilterOptions }] : []),
          ...(provinceFilterOptions.length > 0 ? [{ columnId: 'province', title: tReg('selectProvince'), options: provinceFilterOptions }] : []),
          ...(cityFilterOptions.length > 0 ? [{ columnId: 'city', title: 'Kabupaten/Kota', options: cityFilterOptions }] : [])
        ]}
      />

      <div className="bg-card relative overflow-hidden rounded-md border-0 shadow-xs">
        <DataTableLoadingOverlay isUpdating={isUpdating} text={tCommon('status.loading')} />

        <div className="overflow-x-auto">
          {showSkeleton ? (
            <DataTableSkeleton columnCount={columns.length} rowCount={perPage} />
          ) : (
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
