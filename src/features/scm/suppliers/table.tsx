'use client'

import { useMemo } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTable } from '@/components/data-table'
import { useSupplierContext } from '@/contexts/scm/supplier.context'
import { useSupplierCategoryOptions } from '@/hooks/scm/use-supplier-categories'
import { useSuppliers } from '@/hooks/scm/use-suppliers'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'

import { getSupplierColumns } from './columns'

import type { ReactElement } from 'react'

export function SuppliersTable(): ReactElement {
  // Translations
  const t = useTranslations('scm.suppliers')

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
    isUpdating
  } = useDataTableUrlState({ filterKeys: ['categoryIds'] })

  // Data fetching and server pagination
  const { data: categoryOptions = [] } = useSupplierCategoryOptions()

  const categoryFilterValues = useMemo(() => {
    const filter = columnFilters.find((f) => f.id === 'categoryIds')
    if (!filter || !Array.isArray(filter.value)) return undefined
    return filter.value.map((v) => Number(v)).filter((v) => !isNaN(v) && v > 0)
  }, [columnFilters])

  const { data, isLoading } = useSuppliers({
    page,
    perPage,
    search,
    categoryIds: categoryFilterValues
  })

  const items = useMemo(() => data?.items ?? [], [data?.items])
  const total = data?.total ?? 0

  // Column definitions
  const columns = useMemo(
    () =>
      getSupplierColumns({
        t,
        onView: handleView,
        onEdit: handleEdit,
        onToggleStatus: handleToggleStatus
      }),
    [t, handleView, handleEdit, handleToggleStatus]
  )

  // Filter options
  const filters = useMemo(
    () => [
      {
        columnId: 'categoryIds',
        title: t('table.columns.categories'),
        options: categoryOptions.map((opt) => ({
          label: opt.displayName || opt.name,
          value: String(opt.id)
        }))
      }
    ],
    [t, categoryOptions]
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
