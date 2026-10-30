'use client'

import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { getColumns } from './columns'

import type { ColumnFiltersState, SortingState, VisibilityState } from '@tanstack/react-table'
import type { ReactElement } from 'react'
import type { FarmerRecord } from './actions'

export interface FarmersTableProps {
  data: FarmerRecord[]
}

export function FarmersTable({ data }: FarmersTableProps): ReactElement {
  const tTrace = useTranslations('traceability.farmers')
  const tCommon = useTranslations('common')

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([{ id: 'ref', desc: false }])
  const [globalFilter, setGlobalFilter] = useState<string>('')

  const columns = useMemo(() => getColumns({ tTrace, tCommon }), [tTrace, tCommon])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      globalFilter
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  })

  // Faceted filter options for commodities
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

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder={tCommon('actions.search')}
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

      <div className="bg-card overflow-hidden rounded-md border-0 shadow-xs">
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
        </div>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
