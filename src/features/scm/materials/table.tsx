/**
 * table.tsx — Datatable component for Material Master
 * Syailendra Group ERP — SCM Pillar
 */

'use client'

import { useMemo } from 'react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTableLoadingOverlay, DataTablePagination, DataTableSkeleton, DataTableToolbar } from '@/components/data-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useMaterial } from '@/contexts/scm/material.context'
import { useMaterialsPaginatedQuery } from '@/hooks/scm/use-materials'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'
import { useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import { getColumns } from './columns'

import type { MaterialRecord } from '@/types/scm/material'
import type { ReactElement } from 'react'

const FILTER_KEYS = ['category', 'tracking']

export function MaterialsTable(): ReactElement {
  const t = useTranslations('scm.materials')
  const tCommon = useTranslations('common')
  const { setOpen, setCurrentRow } = useMaterial()
  const router = useRouter()

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
    defaultSort: 'default_code.asc',
    filterKeys: FILTER_KEYS
  })

  const categoryList = getArrayFilter('category')
  const trackingList = getArrayFilter('tracking')

  const { data: result, isLoading } = useMaterialsPaginatedQuery({
    page,
    perPage,
    search,
    category: categoryList.length > 0 ? categoryList : undefined,
    tracking: trackingList.length > 0 ? trackingList : undefined,
    order: orderOdoo
  })

  const records = result?.records ?? []
  const totalCount = result?.totalCount ?? 0

  const columns = useMemo(
    () =>
      getColumns({
        t,
        tCommon,
        onView: (material: MaterialRecord) => {
          setCurrentRow(material)
          setOpen('view')
        },
        onEdit: (material: MaterialRecord) => {
          router.push(`/scm/materials/${material.id}/edit`)
        },
        onDelete: (material: MaterialRecord) => {
          setCurrentRow(material)
          setOpen('delete')
        }
      }),
    [t, tCommon, setCurrentRow, setOpen, router]
  )

  const filterConfigs = useMemo(
    () => [
      {
        columnId: 'category',
        title: t('table.filters.category'),
        options: [
          { label: t('categories.essential_oils'), value: 'essential_oils' },
          { label: t('categories.natural_isolates'), value: 'natural_isolates' },
          { label: t('categories.carrier_oils'), value: 'carrier_oils' },
          { label: t('categories.hydrosols'), value: 'hydrosols' },
          { label: t('categories.raw_biomass'), value: 'raw_biomass' },
          { label: t('categories.packaging'), value: 'packaging' }
        ],
        selectedValues: categoryList,
        onFilterChange: (values: string[] | undefined) => {
          createColumnFiltersHandler(FILTER_KEYS)([{ id: 'category', value: values }])
        }
      },
      {
        columnId: 'tracking',
        title: t('table.filters.tracking'),
        options: [
          { label: t('trackingOptions.lot'), value: 'lot' },
          { label: t('trackingOptions.serial'), value: 'serial' },
          { label: t('trackingOptions.none'), value: 'none' }
        ],
        selectedValues: trackingList,
        onFilterChange: (values: string[] | undefined) => {
          createColumnFiltersHandler(FILTER_KEYS)([{ id: 'tracking', value: values }])
        }
      }
    ],
    [t, categoryList, trackingList, createColumnFiltersHandler]
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
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange: createColumnFiltersHandler(FILTER_KEYS),
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} searchPlaceholder={t('table.searchPlaceholder')} filters={filterConfigs} onReset={resetFilters} />

      <div className="bg-card relative rounded-md border shadow-xs">
        <DataTableLoadingOverlay isUpdating={isUpdating} text={tCommon('status.loading')} />

        {isLoading ? (
          <DataTableSkeleton columnCount={columns.length} rowCount={perPage} />
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className={cn(header.column.id === 'actions' && 'w-25 text-center')}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cn(cell.column.id === 'actions' && 'text-center')}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center text-xs">
                    {t('table.emptyState')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
