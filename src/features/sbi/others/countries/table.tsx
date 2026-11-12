'use client'

import { useMemo } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTable } from '@/components/data-table'
import { useCountry } from '@/contexts/sbi/others/country.context'
import { useCountriesPaginatedQuery } from '@/hooks/sbi/others/use-countries'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'

import { getColumns } from './columns'

import type { ReactElement } from 'react'

export function CountriesTable(): ReactElement {
  // Translations
  const t = useTranslations('others.countries')
  const tCommon = useTranslations('common')

  // Context and action handlers
  const { handleView, handleEdit, handleDelete } = useCountry()

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
    resetFilters,
    onPaginationChange,
    onSortingChange,
    onGlobalFilterChange
  } = useDataTableUrlState({
    defaultSort: 'name.asc'
  })

  // Data fetching and server pagination
  const {
    data: result,
    isLoading,
    isFetching
  } = useCountriesPaginatedQuery({
    page,
    perPage,
    search,
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
    getCoreRowModel: getCoreRowModel()
  })

  const showSkeleton = isLoading || (isFetching && records.length === 0)

  // Render datatable layout
  return <DataTable table={table} showSkeleton={showSkeleton} isUpdating={isUpdating} onReset={resetFilters} />
}
