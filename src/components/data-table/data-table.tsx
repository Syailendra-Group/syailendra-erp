'use client'

import { flexRender } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { DataTableLoadingOverlay } from './loading-overlay'
import { DataTablePagination } from './pagination'
import { DataTableSkeleton } from './skeleton'
import { DataTableToolbar } from './toolbar'

import type { Row, Table as TanstackTable } from '@tanstack/react-table'
import type { ReactElement, ReactNode } from 'react'
import type { DataTableDateRangeConfig, DataTableFilterField } from './toolbar'

export interface DataTableProps<TData> {
  table: TanstackTable<TData>
  /** Status background updating / refetching */
  isUpdating?: boolean
  /** Status initial loading / page switching skeleton */
  showSkeleton?: boolean
  /** Konfigurasi faceted filters di toolbar */
  filters?: DataTableFilterField[]
  /** Filter rentang tanggal (default: nonaktif) */
  dateRange?: DataTableDateRangeConfig
  /** Placeholder kustom input pencarian (default: tCommon('actions.search')) */
  searchPlaceholder?: string
  /** Callback reset filter */
  onReset?: () => void
  /** Override skeleton column count (default: calculated from visible columns) */
  columnCount?: number
  /** Override skeleton row count (default: calculated from pageSize) */
  rowCount?: number
  /** Pesan kustom ketika data kosong */
  emptyMessage?: string
  /** Pesan kustom ketika loading overlay aktif */
  loadingMessage?: string
  /** Custom row className generator function */
  getRowClassName?: (row: Row<TData>) => string
  className?: string
  children?: ReactNode
}

export function DataTable<TData>({
  table,
  isUpdating = false,
  showSkeleton = false,
  filters,
  dateRange,
  searchPlaceholder,
  onReset,
  columnCount,
  rowCount,
  emptyMessage,
  loadingMessage,
  getRowClassName,
  className,
  children
}: DataTableProps<TData>): ReactElement {
  const tCommon = useTranslations('common')
  const totalColumns = columnCount ?? table.getVisibleLeafColumns().length
  const totalRows = rowCount ?? table.getState().pagination.pageSize

  return (
    <div className={cn('space-y-4', className)}>
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder || tCommon('actions.search')}
        onReset={onReset}
        filters={filters}
        dateRange={dateRange}
      />

      <div className="bg-card relative rounded-md border shadow-xs">
        <DataTableLoadingOverlay isUpdating={isUpdating} text={loadingMessage || tCommon('status.loading')} />

        {showSkeleton ? (
          <DataTableSkeleton columnCount={totalColumns} rowCount={totalRows} />
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
                  <TableRow key={row.id} className={cn(getRowClassName ? getRowClassName(row) : 'hover:bg-muted/30 transition-colors')}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5 text-xs">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={totalColumns} className="text-muted-foreground h-24 text-center text-xs">
                    {emptyMessage || tCommon('table.noResults')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <DataTablePagination table={table} />

      {children}
    </div>
  )
}
