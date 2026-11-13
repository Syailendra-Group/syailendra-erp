'use client'

import { useMemo } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTable } from '@/components/data-table'
import { useEmployees } from '@/contexts/hrm/employee.context'
import { useDepartmentOptionsQuery, useEmployeesPaginatedQuery } from '@/hooks/hrm/use-employees'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'

import { getColumns } from './columns'

import type { ReactElement } from 'react'

const FILTER_KEYS = ['department', 'active']

export function EmployeesTable(): ReactElement {
  // Translations
  const tAdmin = useTranslations('admin.employees')
  const tCommon = useTranslations('common')

  // Context and action handlers
  const { handleView, handleEdit, handleDelete } = useEmployees()

  // URL state controller
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
    defaultSort: 'name.asc',
    filterKeys: FILTER_KEYS
  })

  // Data fetching and server pagination
  const { data: deptOptions = [] } = useDepartmentOptionsQuery()

  const deptList = getArrayFilter('department')
  const statusList = getArrayFilter('active')

  const {
    data: result,
    isLoading,
    isFetching
  } = useEmployeesPaginatedQuery({
    page,
    perPage,
    search,
    departmentId: deptList.length > 0 ? deptList : undefined,
    status: statusList.length > 0 ? statusList : undefined,
    order: orderOdoo
  })

  const employees = result?.records ?? []
  const totalCount = result?.totalCount ?? 0

  // Column definitions
  const columns = useMemo(
    () =>
      getColumns({
        tAdmin,
        tCommon,
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete
      }),
    [tAdmin, tCommon, handleView, handleEdit, handleDelete]
  )

  // Filter options
  const filters = useMemo(
    () => [
      {
        columnId: 'department',
        title: tAdmin('table.department'),
        options: deptOptions.map((d) => ({ label: d.name, value: String(d.id) }))
      },
      {
        columnId: 'active',
        title: tAdmin('table.status'),
        options: [
          { label: tCommon('status.active'), value: 'active' },
          { label: tCommon('status.archived'), value: 'archived' }
        ]
      }
    ],
    [tAdmin, tCommon, deptOptions]
  )

  // Table instance
  const table = useReactTable({
    data: employees,
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

  const showSkeleton = isLoading || (isFetching && employees.length === 0)

  // Render datatable layout
  return (
    <DataTable
      table={table}
      showSkeleton={showSkeleton}
      isUpdating={isUpdating}
      searchPlaceholder={tCommon('actions.search')}
      onReset={resetFilters}
      filters={filters}
    />
  )
}
