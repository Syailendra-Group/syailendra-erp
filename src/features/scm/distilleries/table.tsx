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

const FILTER_KEYS = ['distillation_method', 'active']

const METHOD_VALUES = ['steam', 'water_dist', 'water_steam', 'hydrodiffusion', 'co2', 'cold_press', 'solvent', 'enfleurage']

export function DistilleriesTable(): ReactElement {
  const t = useTranslations('scm.distilleries')
  const tCommon = useTranslations('common')

  const { handleView, handleEdit, handleDelete } = useDistilleries()

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
    defaultSort: 'code.asc',
    filterKeys: FILTER_KEYS
  })

  const methodList = getArrayFilter('distillation_method')
  const statusList = getArrayFilter('active')
  const activeFilter = statusList.length === 1 ? statusList[0] === 'active' : undefined

  const {
    data: result,
    isLoading,
    isFetching
  } = useDistilleriesPaginatedQuery({
    page,
    perPage,
    search,
    methods: methodList.length > 0 ? methodList : undefined,
    active: activeFilter,
    order: orderOdoo
  })

  const distilleries = result?.records ?? []
  const totalCount = result?.totalCount ?? 0

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

  const filters = useMemo(
    () => [
      {
        columnId: 'distillation_method',
        title: t('table.method'),
        options: METHOD_VALUES.map((value) => ({ label: t(`methods.${value}`), value }))
      },
      {
        columnId: 'active',
        title: t('table.status'),
        options: [
          { label: tCommon('status.active'), value: 'active' },
          { label: tCommon('status.archived'), value: 'archived' }
        ]
      }
    ],
    [t, tCommon]
  )

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

  return <DataTable table={table} showSkeleton={showSkeleton} isUpdating={isUpdating} onReset={resetFilters} filters={filters} />
}
