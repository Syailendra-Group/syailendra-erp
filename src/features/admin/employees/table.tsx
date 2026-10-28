'use client'

import * as React from 'react'
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
import { UserPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { DataTableBulkActions, DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useEmployees } from '@/contexts/employees-context'

import type { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from '@tanstack/react-table'
import type { EmployeeRecord } from './actions'

export interface EmployeesTableProps {
  columns: ColumnDef<EmployeeRecord>[]
  data: EmployeeRecord[]
}

export function EmployeesTable({ columns, data }: EmployeesTableProps): React.ReactElement {
  const tAdmin = useTranslations('admin.employees')
  const tCommon = useTranslations('common')
  const { setOpen, setCurrentRow, departments } = useEmployees()

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState<string>('')

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
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
    { label: 'Aktif', value: 'true' },
    { label: 'Diarsipkan', value: 'false' }
  ]

  return (
    <div className="space-y-4">
      {/* Complete DataTable Toolbar with faceted filters */}
      <DataTableToolbar
        table={table}
        searchPlaceholder={tCommon('actions.search')}
        filters={[
          {
            columnId: 'department_id',
            title: 'Departemen',
            options: departmentFilterOptions
          },
          {
            columnId: 'active',
            title: 'Status',
            options: statusFilterOptions
          }
        ]}
      >
        <Button
          size="sm"
          onClick={() => {
            setCurrentRow(null)
            setOpen('add')
          }}
          className="h-8 cursor-pointer gap-2 text-xs font-semibold"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>{tAdmin('actions.add')}</span>
        </Button>
      </DataTableToolbar>

      {/* Table Wrapper Borderless with Card background */}
      <div className="bg-card overflow-hidden rounded-xl shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan} className="text-xs">
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="hover:bg-muted/30 transition-colors">
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
                  {tCommon('status.empty')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* TanStack Table Pagination */}
      <DataTablePagination table={table} />

      {/* Bulk Actions Floating Bar */}
      <DataTableBulkActions
        table={table}
        onBulkDelete={(rows) => {
          console.log('Bulk delete / archive request for rows:', rows)
        }}
      />
    </div>
  )
}
