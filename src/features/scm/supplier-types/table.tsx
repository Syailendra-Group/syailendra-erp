/**
 * table.tsx — Supplier Types data state machine (server-side pagination)
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { useMemo } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTable } from '@/components/data-table'
import { useSupplierTypeContext } from '@/contexts/scm/supplier-type.context'
import { useSupplierTypes } from '@/hooks/scm/use-supplier-types'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'

import { getSupplierTypeColumns } from './columns'

import type { ReactElement } from 'react'

export function SupplierTypesTable(): ReactElement {
  // Translations
  const t = useTranslations('scm.supplierTypes')
  const tCommon = useTranslations('common')

  // Context and action handlers
  const { handleView, handleEdit, handleToggleStatus } = useSupplierTypeContext()

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
  const { data, isLoading } = useSupplierTypes({ page, perPage, search })

  const items = useMemo(() => data?.items ?? [], [data?.items])
  const total = data?.total ?? 0

  // Column definitions
  const columns = useMemo(
    () => getSupplierTypeColumns({ tCommon, t, onView: handleView, onEdit: handleEdit, onToggleStatus: handleToggleStatus }),
    [t, tCommon, handleView, handleEdit, handleToggleStatus]
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
    />
  )
}
