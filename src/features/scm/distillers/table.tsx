'use client'

import { useMemo } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTable } from '@/components/data-table'
import { useDistillers } from '@/contexts/scm/distiller.context'
import { useDistillersPaginatedQuery } from '@/hooks/scm/use-distillers'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'

import { getColumns } from './columns'

import type { ReactElement } from 'react'

const FILTER_KEYS = ['method', 'active']

export function DistillersTable(): ReactElement {
  // Translations
  const t = useTranslations('traceability')
  const tCommon = useTranslations('common')

  // Context and action handlers
  const { handleView, handleEdit, handleDelete } = useDistillers()

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
  } = useDistillersPaginatedQuery({
    page,
    perPage,
    search,
    method: methodList.length > 0 ? methodList : undefined,
    status: statusList.length > 0 ? statusList : undefined,
    order: orderOdoo
  })

  const distillers = result?.records ?? []
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
        title: t('distillers.table.method'),
        options: [
          { label: t('distillers.methods.steam'), value: 'steam' },
          { label: t('distillers.methods.hydro'), value: 'hydro' },
          { label: t('distillers.methods.water_steam'), value: 'water_steam' },
          { label: t('distillers.methods.cold_pressed'), value: 'cold_pressed' }
        ]
      },
      {
        columnId: 'active',
        title: t('distillers.table.status'),
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
    data: distillers,
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

  const showSkeleton = isLoading || (isFetching && distillers.length === 0)

  // Render datatable layout
  return <DataTable table={table} showSkeleton={showSkeleton} isUpdating={isUpdating} onReset={resetFilters} filters={filters} />
}
