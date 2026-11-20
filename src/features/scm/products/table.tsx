'use client'

import { useMemo } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { PillTabs } from '@/components/button/pill-tabs'
import { DataTable } from '@/components/data-table'
import { InfoAlert } from '@/components/shared/info-alert'
import { useProduct } from '@/contexts/scm/product.context'
import { useProductCategoryCountsQuery, useProductsPaginatedQuery } from '@/hooks/scm/use-products'
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
    updateUrl,
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
  const selectedCategory = categoryList.length === 1 ? (categoryList[0] as ProductCategory) : undefined
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
  const { data: counts } = useProductCategoryCountsQuery()
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
    [t, tCommon, trackingList, activeList, createColumnFiltersHandler]
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

  const categoryTabs = [
    { id: 'all', label: t('table.allCategories'), badge: counts ? Object.values(counts).reduce((sum, count) => sum + count, 0) : undefined },
    ...CATEGORIES.map((category) => ({ id: category, label: t(`categories.${category}`), badge: counts?.[category] ?? 0 }))
  ]
  const selectCategory = (category: string) => {
    updateUrl({ category: category === 'all' ? undefined : category, page: 1 })
  }

  // Render datatable layout
  if (isError) return <InfoAlert variant="destructive" title={t('table.errorTitle')} description={t('table.errorDescription')} />
  return (
    <div className="space-y-4">
      <PillTabs
        items={categoryTabs}
        value={selectedCategory ?? 'all'}
        onValueChange={selectCategory}
        tabListId="product-categories"
        ariaLabel={t('table.filters.category')}
      />
      <div
        id={`product-categories-panel-${selectedCategory ?? 'all'}`}
        role="tabpanel"
        aria-labelledby={`product-categories-tab-${selectedCategory ?? 'all'}`}
      >
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
    </div>
  )
}
