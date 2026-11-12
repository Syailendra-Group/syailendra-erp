'use client'

import { useMemo } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTable } from '@/components/data-table'
import { useMaterial } from '@/contexts/sbi/scm/material.context'
import { useMaterialsPaginatedQuery } from '@/hooks/sbi/scm/use-materials'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'

import { getColumns } from './columns'

import type { ReactElement } from 'react'

const FILTER_KEYS = ['category', 'tracking']

export function MaterialsTable(): ReactElement {
  // Translations
  const t = useTranslations('scm.materials')
  const tCommon = useTranslations('common')

  // Context and action handlers
  const { handleView, handleEdit, handleDelete } = useMaterial()

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
    defaultSort: 'default_code.asc',
    filterKeys: FILTER_KEYS
  })

  // Data fetching and server pagination
  const categoryList = getArrayFilter('category')
  const trackingList = getArrayFilter('tracking')

  const { data: result, isLoading } = useMaterialsPaginatedQuery({
    page,
    perPage,
    search,
    category: categoryList.length > 0 ? categoryList : undefined,
    tracking: trackingList.length > 0 ? trackingList : undefined,
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
  const filterConfigs = useMemo(
    () => [
      {
        columnId: 'category',
        title: t('table.filters.category'),
        options: [
          { label: t('categories.essential_oils'), value: 'essential_oils' },
          { label: t('categories.natural_isolates'), value: 'natural_isolates' },
          { label: t('categories.carrier_oils'), value: 'carrier_oils' },
          { label: t('categories.hydrosols'), value: 'hydrosols' },
          { label: t('categories.raw_biomass'), value: 'raw_biomass' },
          { label: t('categories.packaging'), value: 'packaging' }
        ],
        selectedValues: categoryList,
        onFilterChange: (values: string[] | undefined) => {
          createColumnFiltersHandler(FILTER_KEYS)([{ id: 'category', value: values }])
        }
      },
      {
        columnId: 'tracking',
        title: t('table.filters.tracking'),
        options: [
          { label: t('trackingOptions.lot'), value: 'lot' },
          { label: t('trackingOptions.serial'), value: 'serial' },
          { label: t('trackingOptions.none'), value: 'none' }
        ],
        selectedValues: trackingList,
        onFilterChange: (values: string[] | undefined) => {
          createColumnFiltersHandler(FILTER_KEYS)([{ id: 'tracking', value: values }])
        }
      }
    ],
    [t, categoryList, trackingList, createColumnFiltersHandler]
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
  return (
    <DataTable
      table={table}
      showSkeleton={isLoading}
      isUpdating={isUpdating}
      searchPlaceholder={t('table.searchPlaceholder')}
      filters={filterConfigs}
      onReset={resetFilters}
      emptyMessage={t('table.emptyState')}
    />
  )
}
