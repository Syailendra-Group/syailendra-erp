'use client'

import { useMemo } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTable } from '@/components/data-table'
import { useFarmers } from '@/contexts/scm/farmer.context'
import { getColumns } from '@/features/scm/farmers/columns'
import { useFarmersPaginatedQuery } from '@/hooks/scm/use-farmers'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'

import type { ReactElement } from 'react'

const FILTER_KEYS = ['commodity']

export function FarmersTable(): ReactElement {
  // Translations
  const t = useTranslations('scm.farmers')
  const tCommon = useTranslations('common')

  // Context and action handlers
  const { handleView, handleEdit, handleDelete } = useFarmers()

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
    defaultSort: 'ref.asc',
    filterKeys: FILTER_KEYS
  })

  // Data fetching and server pagination
  const commodityList = getArrayFilter('commodity')

  const {
    data: result,
    isLoading,
    isFetching
  } = useFarmersPaginatedQuery({
    page,
    perPage,
    search,
    commodity: commodityList.length > 0 ? commodityList : undefined,
    order: orderOdoo
  })

  const farmers = result?.records ?? []
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
        columnId: 'commodity',
        title: t('table.commodity'),
        options: [
          { label: t('commodities.gaharu'), value: 'gaharu' },
          { label: t('commodities.nilam'), value: 'nilam' },
          { label: t('commodities.serai'), value: 'serai' },
          { label: t('commodities.kopi'), value: 'kopi' },
          { label: t('commodities.cengkeh'), value: 'cengkeh' }
        ]
      }
    ],
    [t]
  )

  // Table instance
  const table = useReactTable({
    data: farmers,
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

  const showSkeleton = isLoading || (isFetching && farmers.length === 0)

  // Render datatable layout
  return <DataTable table={table} showSkeleton={showSkeleton} isUpdating={isUpdating} onReset={resetFilters} filters={filters} />
}
