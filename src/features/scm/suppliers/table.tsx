/**
 * table.tsx — Datatable component for Master Supplier with SectionCard & zero-CLS skeleton
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTableLoadingOverlay } from '@/components/data-table/loading-overlay'
import { DataTablePagination } from '@/components/data-table/pagination'
import { DataTableSkeleton } from '@/components/data-table/skeleton'
import { DataTableToolbar } from '@/components/data-table/toolbar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useSuppliers } from '@/hooks/scm/use-suppliers'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'
import { cn } from '@/lib/utils'

import { getSupplierColumns } from './columns'
import { useSupplierContext } from './supplier.context'

import type { SupplierRecord } from '@/types/scm/supplier'
import type { ReactElement } from 'react'

export function SuppliersTable(): ReactElement {
  const router = useRouter()
  const t = useTranslations('scm.suppliers')
  const tCommon = useTranslations('common')
  const { setOpen, setSelectedSupplier } = useSupplierContext()

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

  const { data, isLoading } = useSuppliers({
    page,
    perPage,
    search
  })

  const items = useMemo(() => data?.items ?? [], [data?.items])
  const total = data?.total ?? 0

  const columns = useMemo(
    () =>
      getSupplierColumns({
        t,
        onView: (item: SupplierRecord) => {
          setSelectedSupplier(item)
          setOpen('view')
        },
        onEdit: (item: SupplierRecord) => {
          router.push(`/scm/suppliers/${item.id}/edit`)
        },
        onToggleStatus: (item: SupplierRecord) => {
          setSelectedSupplier(item)
          setOpen(item.active ? 'archive' : 'restore')
        }
      }),
    [t, router, setOpen, setSelectedSupplier]
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
      {/* Standard DataTableToolbar with Category Filter */}
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
                  <TableRow key={row.id}>
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
