'use client'

import { useMemo } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTable } from '@/components/data-table'
import { useCropContext } from '@/contexts/scm/crop.context'
import { useCrops } from '@/hooks/scm/use-crops'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'
import { CULTIVATION_STATUSES, PLANT_PARTS } from '@/schemas/scm/crop-schema'

import { getCropColumns } from './columns'

import type { ReactElement } from 'react'

const FILTER_KEYS = ['plant_part', 'cultivation_status', 'status']

export function CropsTable(): ReactElement {
  const t = useTranslations('scm.crops')

  const { handleView, handleEdit, handleDelete } = useCropContext()

  const {
    page,
    perPage,
    search,
    sort,
    pagination,
    sorting,
    columnFilters,
    isUpdating,
    getArrayFilter,
    resetFilters,
    onPaginationChange,
    onSortingChange,
    onGlobalFilterChange,
    createColumnFiltersHandler
  } = useDataTableUrlState({
    defaultSort: 'name.asc',
    filterKeys: FILTER_KEYS
  })

  const plantPartFilter = getArrayFilter('plant_part')
  const cultivationFilter = getArrayFilter('cultivation_status')
  const statusFilter = getArrayFilter('status')
  const activeFilter = statusFilter.includes('active') ? true : statusFilter.includes('archived') ? false : undefined

  const [sortField, sortDirection = 'asc'] = sort.split('.')
  const order = `${sortField === 'code' ? 'code' : 'name'} ${sortDirection === 'desc' ? 'desc' : 'asc'}`

  const { data, isLoading, isFetching } = useCrops({
    page,
    perPage,
    search,
    plantParts: plantPartFilter.length > 0 ? plantPartFilter : undefined,
    cultivationStatus: cultivationFilter.length > 0 ? cultivationFilter : undefined,
    active: activeFilter,
    order
  })

  const records = data?.items ?? []
  const totalCount = data?.total ?? 0

  const columns = useMemo(
    () => getCropColumns({ t, onView: handleView, onEdit: handleEdit, onDelete: handleDelete }),
    [t, handleView, handleEdit, handleDelete]
  )

  const filters = useMemo(
    () => [
      {
        columnId: 'plant_part',
        title: t('table.columns.plantPart'),
        options: PLANT_PARTS.map((value) => ({ label: t(`plantParts.${value}`), value }))
      },
      {
        columnId: 'cultivation_status',
        title: t('table.columns.cultivationStatus'),
        options: CULTIVATION_STATUSES.map((value) => ({ label: t(`cultivationStatuses.${value}`), value }))
      },
      {
        columnId: 'status',
        title: t('table.columns.status'),
        options: [
          { label: t('table.status.active'), value: 'active' },
          { label: t('table.status.inactive'), value: 'archived' }
        ]
      }
    ],
    [t]
  )

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
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    onPaginationChange,
    onSortingChange,
    onGlobalFilterChange,
    onColumnFiltersChange: createColumnFiltersHandler(FILTER_KEYS),
    getCoreRowModel: getCoreRowModel()
  })

  const showSkeleton = isLoading || (isFetching && records.length === 0)

  return (
    <DataTable
      table={table}
      showSkeleton={showSkeleton}
      isUpdating={isUpdating}
      onReset={resetFilters}
      filters={filters}
      emptyMessage={t('table.emptyState')}
    />
  )
}
