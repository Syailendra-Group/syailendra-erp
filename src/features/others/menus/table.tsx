'use client'

import { useCallback, useMemo } from 'react'
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { DataTable } from '@/components/data-table'
import { useMenu } from '@/contexts/others/menu.context'
import { useCompaniesQuery } from '@/hooks/others/use-companies'
import { usePillarsQuery, useReassignPillarMutation } from '@/hooks/others/use-menus'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'

import { getColumns } from './columns'

import type { ReactElement } from 'react'

export function MenusTable(): ReactElement {
  const t = useTranslations('others.menus')
  const tCommon = useTranslations('common')
  const { handleView, handleEdit } = useMenu()

  const { data: pillarsData, isLoading } = usePillarsQuery()
  const { data: companiesData } = useCompaniesQuery()
  const { mutateAsync: reassignPillar } = useReassignPillarMutation()

  const records = useMemo(() => pillarsData?.pillars || [], [pillarsData])
  const companies = useMemo(() => companiesData?.companies || [], [companiesData])

  const {
    search,
    pagination,
    sorting,
    columnFilters,
    resetFilters,
    onPaginationChange,
    onSortingChange,
    onGlobalFilterChange,
    createColumnFiltersHandler
  } = useDataTableUrlState({
    defaultSort: 'sequence.asc',
    defaultPerPage: 20,
    filterKeys: ['company_id']
  })

  const handleReassign = useCallback(
    async (pillarId: number, companyId: number) => {
      try {
        const res = await reassignPillar({ pillarId, companyId })
        if (res.success) {
          toast.success(t('reassignSuccess'))
        } else {
          toast.error(res.error || t('saveError'))
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : String(err))
      }
    },
    [reassignPillar, t]
  )

  const columns = useMemo(
    () =>
      getColumns({
        t,
        tCommon,
        companies: companies.map((c) => ({
          id: c.id,
          short_name: c.short_name,
          name: c.name,
          logo_web: c.logo_web
        })),
        onView: handleView,
        onEdit: handleEdit,
        onReassign: handleReassign
      }),
    [t, tCommon, companies, handleView, handleEdit, handleReassign]
  )

  const filterFields = useMemo(
    () => [
      {
        columnId: 'company_id',
        title: t('table.owner'),
        options: companies.map((c) => ({
          label: c.short_name,
          value: String(c.id)
        }))
      }
    ],
    [companies, t]
  )

  const table = useReactTable({
    data: records,
    columns,
    state: {
      pagination,
      sorting,
      columnFilters,
      globalFilter: search
    },
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange: createColumnFiltersHandler(['company_id']),
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return <DataTable table={table} filters={filterFields} showSkeleton={isLoading && records.length === 0} onReset={resetFilters} />
}
