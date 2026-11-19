'use client'

import { useMemo } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTable } from '@/components/data-table'
import { useSupplierContext } from '@/contexts/scm/supplier.context'
import { useSupplierCategoryOptions } from '@/hooks/scm/use-supplier-categories'
import { useSupplierTypeOptions } from '@/hooks/scm/use-supplier-types'
import { useSuppliers } from '@/hooks/scm/use-suppliers'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'

import { getSupplierColumns } from './columns'

import type { ReactElement } from 'react'

const FILTER_KEYS = ['categoryIds', 'supplierTypeId', 'needsReview']

export function SuppliersTable(): ReactElement {
  // Translations
  const t = useTranslations('scm.suppliers')
  const tCommon = useTranslations('common')

  // Context and action handlers
  const { handleView, handleEdit, handleToggleStatus } = useSupplierContext()

  // URL state controller
  const {
    page,
    perPage,
    search,
    pagination,
    sorting,
    columnFilters,
    onPaginationChange,
    onSortingChange,
    onGlobalFilterChange,
    resetFilters,
    isUpdating,
    getArrayFilter,
    createColumnFiltersHandler
  } = useDataTableUrlState({ filterKeys: FILTER_KEYS })

  // Data fetching and server pagination
  const { data: categoryOptions = [] } = useSupplierCategoryOptions()
  const { data: supplierTypeOptions = [] } = useSupplierTypeOptions()

  const categoryFilter = getArrayFilter('categoryIds')
  const supplierTypeFilter = getArrayFilter('supplierTypeId')
  const needsReviewFilter = getArrayFilter('needsReview')

  const categoryFilterValues = useMemo(() => {
    const filter = columnFilters.find((f) => f.id === 'categoryIds')
    if (!filter || !Array.isArray(filter.value)) return undefined
    return filter.value.map((v) => Number(v)).filter((v) => !isNaN(v) && v > 0)
  }, [columnFilters])

  const supplierTypeFilterValue = useMemo(() => {
    const filter = columnFilters.find((f) => f.id === 'supplierTypeId')
    if (!filter || !Array.isArray(filter.value) || filter.value.length === 0) return null
    const parsed = Number(filter.value[0])
    return Number.isNaN(parsed) || parsed <= 0 ? null : parsed
  }, [columnFilters])

  const needsReviewFilterValue = useMemo(() => {
    const filter = columnFilters.find((f) => f.id === 'needsReview')
    if (!filter || !Array.isArray(filter.value) || filter.value.length === 0) return null
    return String(filter.value[0]) === 'review'
  }, [columnFilters])

  const { data, isLoading } = useSuppliers({
    page,
    perPage,
    search,
    categoryIds: categoryFilterValues,
    supplierTypeId: supplierTypeFilterValue,
    needsReview: needsReviewFilterValue
  })

  const items = useMemo(() => data?.items ?? [], [data?.items])
  const total = data?.total ?? 0

  // Column definitions
  const columns = useMemo(
    () => getSupplierColumns({ tCommon, t, onView: handleView, onEdit: handleEdit, onToggleStatus: handleToggleStatus }),
    [t, tCommon, handleView, handleEdit, handleToggleStatus]
  )

  // Filter options
  const filters = useMemo(
    () => [
      {
        columnId: 'categoryIds',
        title: t('table.columns.categories'),
        options: categoryOptions.map((opt) => ({
          label: opt.displayName,
          value: String(opt.id)
        })),
        selectedValues: categoryFilter,
        onFilterChange: (values: string[] | undefined) => {
          createColumnFiltersHandler(FILTER_KEYS)([{ id: 'categoryIds', value: values }])
        }
      },
      {
        columnId: 'supplierTypeId',
        title: t('table.columns.supplierType'),
        options: supplierTypeOptions.map((opt) => ({
          label: `${opt.code} - ${opt.name}`,
          value: String(opt.id)
        })),
        selectedValues: supplierTypeFilter,
        onFilterChange: (values: string[] | undefined) => {
          createColumnFiltersHandler(FILTER_KEYS)([{ id: 'supplierTypeId', value: values }])
        }
      },
      {
        columnId: 'needsReview',
        title: t('table.columns.needsReview'),
        options: [
          { label: t('table.filters.needsReviewOnly'), value: 'review' },
          { label: t('table.filters.verifiedOnly'), value: 'verified' }
        ],
        selectedValues: needsReviewFilter,
        onFilterChange: (values: string[] | undefined) => {
          createColumnFiltersHandler(FILTER_KEYS)([{ id: 'needsReview', value: values }])
        }
      }
    ],
    [t, categoryOptions, supplierTypeOptions, categoryFilter, supplierTypeFilter, needsReviewFilter, createColumnFiltersHandler]
  )

  // Table instance
  const table = useReactTable({
    data: items,
    columns,
    rowCount: total,
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

  // Render datatable layout
  return (
    <DataTable
      table={table}
      showSkeleton={isLoading}
      isUpdating={isUpdating}
      searchPlaceholder={t('actions.filter')}
      onReset={resetFilters}
      emptyMessage={t('table.emptyState')}
      filters={filters}
    />
  )
}
