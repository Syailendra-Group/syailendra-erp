'use client'

import { useMemo } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTable } from '@/components/data-table'
import { InfoAlert } from '@/components/shared/info-alert'
import { useProduct } from '@/contexts/scm/product.context'
import { useProductsPaginatedQuery } from '@/hooks/scm/use-products'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'

import { getColumns } from './columns'

import type { ProductCategory } from '@/types/scm/product'
import type { ReactElement } from 'react'

const FILTER_KEYS = ['category', 'tracking', 'active']
const CATEGORIES: ProductCategory[] = ['essential_oils', 'natural_isolates', 'carrier_oils', 'hydrosols', 'raw_biomass', 'packaging']

export function ProductsTable(): ReactElement {
  // Translations
  const t = useTranslations('scm.products')
  const tCommon = useTranslations('common')

  // Context and action handlers
  const { handleView, handleEdit, handleDelete, handleToggleStatus } = useProduct()

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
  } = useDataTableUrlState({ defaultSort: 'default_code.asc', filterKeys: FILTER_KEYS })

  // Data fetching and server pagination
  const categoryList = getArrayFilter('category')
  const trackingList = getArrayFilter('tracking')
  const activeList = getArrayFilter('active')
  const activeFilter = activeList.length === 1 ? activeList[0] === 'active' : undefined
  const {
    data: result,
    isLoading,
    isError
  } = useProductsPaginatedQuery({
    page,
    perPage,
    search,
    category: categoryList.length ? categoryList : undefined,
    tracking: trackingList.length ? trackingList : undefined,
    active: activeFilter,
    order: orderOdoo
  })
  const records = result?.records ?? []
  const totalCount = result?.totalCount ?? 0

  // Column definitions
  const columns = useMemo(
    () => getColumns({ t, tCommon, onView: handleView, onEdit: handleEdit, onToggleStatus: handleToggleStatus, onDelete: handleDelete }),
    [t, tCommon, handleView, handleEdit, handleToggleStatus, handleDelete]
  )

  // Filter options
  const filterConfigs = useMemo(
    () => [
      {
        columnId: 'category',
        title: t('table.filters.category'),
        options: CATEGORIES.map((category) => ({ label: t(`categories.${category}`), value: category })),
        selectedValues: categoryList,
        onFilterChange: (values: string[] | undefined) => createColumnFiltersHandler(FILTER_KEYS)([{ id: 'category', value: values }])
      },
      {
        columnId: 'tracking',
        title: t('table.filters.tracking'),
        options: ['lot', 'serial', 'none'].map((value) => ({ label: t(`trackingOptions.${value}`), value })),
        selectedValues: trackingList,
        onFilterChange: (values: string[] | undefined) => createColumnFiltersHandler(FILTER_KEYS)([{ id: 'tracking', value: values }])
      },
      {
        columnId: 'active',
        title: tCommon('status.title'),
        options: [
          { label: tCommon('status.active'), value: 'active' },
          { label: tCommon('status.archived'), value: 'archived' }
        ],
        selectedValues: activeList,
        onFilterChange: (values: string[] | undefined) => createColumnFiltersHandler(FILTER_KEYS)([{ id: 'active', value: values }])
      }
    ],
    [t, tCommon, categoryList, trackingList, activeList, createColumnFiltersHandler]
  )

  // Table instance
  const table = useReactTable({
    data: records,
    columns,
    rowCount: totalCount,
    state: { pagination, sorting, columnFilters, globalFilter: search },
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange: createColumnFiltersHandler(FILTER_KEYS),
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true
  })

  // Render datatable layout
  if (isError) return <InfoAlert variant="destructive" title={t('table.errorTitle')} description={t('table.errorDescription')} />
  return (
    <div className="space-y-4">
      <DataTable
        table={table}
        showSkeleton={isLoading}
        isUpdating={isUpdating}
        searchPlaceholder={t('table.searchPlaceholder')}
        filters={filterConfigs}
        onReset={resetFilters}
        emptyMessage={t('table.emptyState')}
      />
    </div>
  )
}
