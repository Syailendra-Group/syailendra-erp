'use client'

import { useMemo } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTable } from '@/components/data-table'
import { useDistilleries } from '@/contexts/scm/distillery.context'
import { useDistilleriesPaginatedQuery } from '@/hooks/scm/use-distilleries'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'

import { getColumns } from './columns'

import type { ReactElement } from 'react'

const FILTER_KEYS = ['method', 'active']

export function DistilleriesTable(): ReactElement {
  // Translations
  const t = useTranslations('traceability')
  const tCommon = useTranslations('common')

  // Context and action handlers
  const { handleView, handleEdit, handleDelete } = useDistilleries()

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
    defaultSort: 'ref.asc',
    filterKeys: FILTER_KEYS
  })

  // Data fetching and server pagination
  const methodList = getArrayFilter('method')
  const statusList = getArrayFilter('active')

  const {
    data: result,
    isLoading,
    isFetching
  } = useDistilleriesPaginatedQuery({
    page,
    perPage,
    search,
    method: methodList.length > 0 ? methodList : undefined,
    status: statusList.length > 0 ? statusList : undefined,
    order: orderOdoo
  })

  const distilleries = result?.records ?? []
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
        columnId: 'method',
        title: t('distilleries.table.method'),
        options: [
          { label: t('distilleries.methods.steam'), value: 'steam' },
          { label: t('distilleries.methods.hydro'), value: 'hydro' },
          { label: t('distilleries.methods.water_steam'), value: 'water_steam' },
          { label: t('distilleries.methods.cold_pressed'), value: 'cold_pressed' }
        ]
      },
      {
        columnId: 'active',
        title: t('distilleries.table.status'),
        options: [
          { label: tCommon('status.active'), value: 'active' },
          { label: tCommon('status.archived'), value: 'archived' }
        ]
      }
    ],
    [t, tCommon]
  )

  // Table instance
  const table = useReactTable({
    data: distilleries,
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

  const showSkeleton = isLoading || (isFetching && distilleries.length === 0)

  // Render datatable layout
  return <DataTable table={table} showSkeleton={showSkeleton} isUpdating={isUpdating} onReset={resetFilters} filters={filters} />
}
