/**
 * table.tsx — Supplier Categories data state machine (server-side pagination)
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { useMemo } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTable } from '@/components/data-table'
import { useSupplierCategoryContext } from '@/contexts/scm/supplier-category.context'
import { useSupplierCategories } from '@/hooks/scm/use-supplier-categories'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'
import { cn } from '@/lib/utils'

import { getSupplierCategoryColumns } from './columns'

import type { SupplierCategoryRecord } from '@/types/scm/supplier-category'
import type { Row } from '@tanstack/react-table'
import type { ReactElement } from 'react'

export function SupplierCategoriesTable(): ReactElement {
  // Translations
  const t = useTranslations('scm.supplierCategories')

  // Context and action handlers
  const { handleView, handleEdit, handleDelete } = useSupplierCategoryContext()

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
  } = useDataTableUrlState()

  // Data fetching and server pagination
  const { data, isLoading } = useSupplierCategories({ page, perPage, search })

  const items = useMemo(() => data?.items ?? [], [data?.items])
  const total = data?.total ?? 0

  // Column definitions
  const columns = useMemo(
    () =>
      getSupplierCategoryColumns({
        t,
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete
      }),
    [t, handleView, handleEdit, handleDelete]
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
      getRowClassName={(row: Row<SupplierCategoryRecord>) =>
        cn(
          row.original.depth === 0
            ? 'bg-muted/40 border-border/80 hover:bg-muted/50 border-t font-semibold transition-colors'
            : 'hover:bg-muted/20 transition-colors'
        )
      }
    />
  )
}
