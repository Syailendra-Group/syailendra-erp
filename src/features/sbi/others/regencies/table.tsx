'use client'

import { useMemo } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTable } from '@/components/data-table'
import { useRegency } from '@/contexts/sbi/others/regency.context'
import { useRegenciesPaginatedQuery, useRegencyFilterOptionsQuery } from '@/hooks/sbi/others/use-regencies'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'

import { getColumns } from './columns'

import type { ReactElement } from 'react'

const FILTER_KEYS = ['scope', 'province']

export function RegenciesTable(): ReactElement {
  // Translations
  const t = useTranslations('others.regencies')
  const tCommon = useTranslations('common')
  const tReg = useTranslations('regional.common')

  // Context and action handlers
  const { handleView, handleEdit, handleDelete } = useRegency()

  // URL state controller
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

  // Data fetching and server pagination
  const { data: filterOptions } = useRegencyFilterOptionsQuery()

  const scopeFilter = getArrayFilter('scope')
  const provinceFilter = getArrayFilter('province')

  const {
    data: result,
    isLoading,
    isFetching
  } = useRegenciesPaginatedQuery({
    page,
    perPage,
    search,
    scope: scopeFilter.length > 0 ? scopeFilter : undefined,
    stateId: provinceFilter.length > 0 ? provinceFilter : undefined,
    order: orderOdoo
  })

  const records = result?.records ?? []
  const totalCount = result?.totalCount ?? 0

  // Column definitions
  const columns = useMemo(
    () =>
      getColumns({
        t,
        tCommon,
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete
      }),
    [t, tCommon, handleView, handleEdit, handleDelete]
  )

  // Filter options
  const filters = useMemo(
    () => [
      {
        columnId: 'scope',
        title: tReg('category'),
        options: [
          { label: tReg('domestic'), value: 'domestic' },
          { label: tReg('international'), value: 'foreign' }
        ]
      },
      ...((filterOptions?.states || []).length > 0
        ? [
            {
              columnId: 'province',
              title: tReg('selectProvince'),
              options: (filterOptions?.states || []).map((item) => ({ label: item.name, value: String(item.id) }))
            }
          ]
        : [])
    ],
    [tReg, filterOptions?.states]
  )

  // Table instance
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

  const showSkeleton = isLoading || (isFetching && records.length === 0)

  // Render datatable layout
  return <DataTable table={table} showSkeleton={showSkeleton} isUpdating={isUpdating} onReset={resetFilters} filters={filters} />
}
