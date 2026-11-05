/**
 * table.tsx — Datatable component for Supplier Categories with universal SectionCard & zero-CLS skeleton
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { useMemo } from 'react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTableLoadingOverlay } from '@/components/data-table/loading-overlay'
import { DataTablePagination } from '@/components/data-table/pagination'
import { DataTableSkeleton } from '@/components/data-table/skeleton'
import { DataTableToolbar } from '@/components/data-table/toolbar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useSupplierCategories } from '@/hooks/scm/use-supplier-categories'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'
import { cn } from '@/lib/utils'

import { getSupplierCategoryColumns } from './columns'
import { useSupplierCategoryContext } from './supplier-category.context'

import type { SupplierCategoryRecord } from '@/types/scm/supplier-category'
import type { ReactElement } from 'react'

export function SupplierCategoriesTable(): ReactElement {
  const t = useTranslations('scm.supplierCategories')
  const tCommon = useTranslations('common')
  const { setOpen, setSelectedCategory } = useSupplierCategoryContext()

  const {
    page,
    perPage,
    search,
    pagination,
    sorting,
    columnFilters,
    onPaginationChange,
    onSortingChange,
    onGlobalFilterChange,
    resetFilters,
    isUpdating
  } = useDataTableUrlState()

  const { data, isLoading } = useSupplierCategories({
    page,
    perPage,
    search
  })

  const items = useMemo(() => data?.items ?? [], [data?.items])
  const total = data?.total ?? 0

  const columns = useMemo(
    () =>
      getSupplierCategoryColumns({
        t,
        onView: (item: SupplierCategoryRecord) => {
          setSelectedCategory(item)
          setOpen('view')
        },
        onEdit: (item: SupplierCategoryRecord) => {
          setSelectedCategory(item)
          setOpen('edit')
        },
        onDelete: (item: SupplierCategoryRecord) => {
          setSelectedCategory(item)
          setOpen('delete')
        }
      }),
    [t, setOpen, setSelectedCategory]
  )

  const table = useReactTable({
    data: items,
    columns,
    rowCount: total,
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
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <div className="space-y-4">
      {/* Standard DataTableToolbar */}
      <DataTableToolbar table={table} searchPlaceholder={t('actions.filter')} onReset={resetFilters} />

      {/* Main Table Box with Self-Contained Skeleton & Overlay */}
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
                    <TableHead key={header.id} className={cn(header.column.id === 'actions' && 'w-28 text-center')}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      row.original.isParent
                        ? 'bg-muted/40 border-border/80 hover:bg-muted/50 border-t font-semibold transition-colors'
                        : 'hover:bg-muted/20 transition-colors'
                    )}
                  >
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

      {/* Pagination Footer */}
      <DataTablePagination table={table} />
    </div>
  )
}
