'use client'

import { useMemo } from 'react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTableLoadingOverlay, DataTablePagination, DataTableSkeleton, DataTableToolbar } from '@/components/data-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useVillage } from '@/contexts/others/village.context'
import { useVillageFilterOptionsQuery, useVillagesPaginatedQuery } from '@/hooks/others/use-villages'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'
import { cn } from '@/lib/utils'

import { getColumns } from './columns'

import type { VillageRecord } from '@/types/others/village'
import type { ReactElement } from 'react'

const FILTER_KEYS = ['scope', 'country', 'province', 'city', 'district']

export function VillagesTable(): ReactElement {
  const t = useTranslations('others.villages')
  const tCommon = useTranslations('common')
  const tReg = useTranslations('regional.common')
  const { setOpen, setCurrentRow } = useVillage()

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

  const { data: filterOptions } = useVillageFilterOptionsQuery()

  const scopeFilter = getArrayFilter('scope')
  const countryFilter = getArrayFilter('country')
  const provinceFilter = getArrayFilter('province')
  const cityFilter = getArrayFilter('city')
  const districtFilter = getArrayFilter('district')

  const {
    data: result,
    isLoading,
    isFetching
  } = useVillagesPaginatedQuery({
    page,
    perPage,
    search,
    scope: scopeFilter.length > 0 ? scopeFilter : undefined,
    countryId: countryFilter.length > 0 ? countryFilter : undefined,
    stateId: provinceFilter.length > 0 ? provinceFilter : undefined,
    cityId: cityFilter.length > 0 ? cityFilter : undefined,
    districtId: districtFilter.length > 0 ? districtFilter : undefined,
    order: orderOdoo
  })

  const records = result?.records ?? []
  const totalCount = result?.totalCount ?? 0

  const columns = useMemo(
    () =>
      getColumns({
        t,
        tCommon,
        onView: (item: VillageRecord) => {
          setCurrentRow(item)
          setOpen('view')
        },
        onEdit: (item: VillageRecord) => {
          setCurrentRow(item)
          setOpen('edit')
        },
        onDelete: (item: VillageRecord) => {
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

  const districtFilterOptions = useMemo(
    () => (filterOptions?.districts || []).map((d) => ({ label: d.name, value: String(d.id) })),
    [filterOptions?.districts]
  )

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
          ...(cityFilterOptions.length > 0 ? [{ columnId: 'city', title: 'Kabupaten/Kota', options: cityFilterOptions }] : []),
          ...(districtFilterOptions.length > 0 ? [{ columnId: 'district', title: tReg('selectDistrict'), options: districtFilterOptions }] : [])
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
