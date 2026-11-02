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
import { useEmployees } from '@/contexts/hris/employee.context'
import { cn } from '@/lib/utils'

import { getColumns } from './columns'

import type { EmployeeRecord } from '@/actions/hris/employee.action'
import type { ColumnFiltersState, SortingState, VisibilityState } from '@tanstack/react-table'
import type { ReactElement } from 'react'

export interface EmployeesTableProps {
  data: EmployeeRecord[]
}

export function EmployeesTable({ data }: EmployeesTableProps): ReactElement {
  const tAdmin = useTranslations('admin.employees')
  const tCommon = useTranslations('common')
  const { departments } = useEmployees()

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')

  const columns = useMemo(() => getColumns({ tAdmin, tCommon }), [tAdmin, tCommon])

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

  const departmentFilterOptions = departments.map((d) => ({
    label: d.name,
    value: d.name
  }))

  const statusFilterOptions = [
    { label: tCommon('status.active'), value: 'true' },
    { label: tCommon('status.archived'), value: 'false' }
  ]

  return (
    <div className="space-y-4">
      {/* DataTable Toolbar with faceted filters */}
      <DataTableToolbar
        table={table}
        searchPlaceholder={tCommon('actions.search')}
        filters={[
          {
            columnId: 'department_id',
            title: tAdmin('table.department'),
            options: departmentFilterOptions
          },
          {
            columnId: 'active',
            title: tAdmin('table.status'),
            options: statusFilterOptions
          }
        ]}
      />

      {/* Table*/}
      <div className="bg-card overflow-hidden rounded-md shadow-xs">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan} className={cn('text-xs', header.column.id === 'actions' && 'text-center')}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
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
                <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center">
                  {tCommon('status.empty')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* TanStack Table Pagination */}
      <DataTablePagination table={table} />
    </div>
  )
}
