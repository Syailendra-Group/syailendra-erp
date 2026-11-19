'use client'

import { useMemo } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { DataTable } from '@/components/data-table'
import { useFarmContext } from '@/contexts/scm/farm.context'
import { useFarmsTableData } from '@/hooks/scm/use-farms'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'
import { FARMING_SYSTEMS } from '@/schemas/scm/farm-schema'

import { getFarmColumns } from './columns'

import type { ReactElement } from 'react'

const FILTER_KEYS = ['farming_system', 'status']

export function FarmsTable(): ReactElement {
  const t = useTranslations('scm.farms')
  const tCommon = useTranslations('common')

  const { handleView, handleDelete } = useFarmContext()

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

  const farmingFilter = getArrayFilter('farming_system')
  const statusFilter = getArrayFilter('status')
  const activeFilter = statusFilter.includes('active') ? true : statusFilter.includes('archived') ? false : undefined

  const [sortField, sortDirection = 'asc'] = sort.split('.')
  const order = `${sortField === 'code' ? 'code' : 'name'} ${sortDirection === 'desc' ? 'desc' : 'asc'}`

  const { data, isLoading, isFetching } = useFarmsTableData({
    page,
    perPage,
    search,
    farmingSystems: farmingFilter.length > 0 ? farmingFilter : undefined,
    active: activeFilter,
    order
  })

  const commodityOptions = useMemo(() => data?.commodityOptions ?? [], [data?.commodityOptions])

  const commodityNames = useMemo(() => {
    const map = new Map<number, string>()
    commodityOptions.forEach((commodity) => map.set(commodity.id, commodity.name))
    return map
  }, [commodityOptions])

  const records = data?.page.items ?? []
  const totalCount = data?.page.total ?? 0

  const columns = useMemo(
    () => getFarmColumns({ tCommon, t, commodityNames, onView: handleView, onDelete: handleDelete }),
    [t, tCommon, commodityNames, handleView, handleDelete]
  )

  const filters = useMemo(
    () => [
      {
        columnId: 'farming_system',
        title: t('table.columns.farmingSystem'),
        options: FARMING_SYSTEMS.map((value) => ({ label: t(`farmingSystems.${value}`), value }))
      },
      {
        columnId: 'status',
        title: t('table.columns.status'),
        options: [
          { label: tCommon('status.active'), value: 'active' },
          { label: tCommon('status.inactive'), value: 'archived' }
        ]
      }
    ],
    [t, tCommon]
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
