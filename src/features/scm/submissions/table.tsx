/**
 * table.tsx — Server-driven TanStack Query table for Partner Submission review
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useLocale, useTranslations } from 'next-intl'

import { DataTable } from '@/components/data-table'
import { Input } from '@/components/ui/input'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'

import { getSubmissionColumns } from './columns'
import { SubmissionReviewDialog } from './review-dialog'
import { useSubmissions } from './use-submissions'

import type { SubmissionRecord } from '@/types/scm/submission'
import type { ReactElement } from 'react'

const FILTER_KEYS = ['status', 'submission_type']

const STATE_FILTERS = ['draft', 'submitted', 'in_review', 'needs_revision', 'approved', 'rejected', 'cancelled'] as const

const KIND_FILTERS = ['petani', 'panen', 'serah_terima', 'distilasi', 'kirim'] as const

export function SubmissionsTable(): ReactElement {
  const t = useTranslations('scm.submissions')
  const locale = useLocale()

  const {
    page,
    perPage,
    search,
    orderOdoo,
    pagination,
    sorting,
    columnFilters,
    isUpdating,
    resetFilters,
    onPaginationChange,
    onSortingChange,
    onGlobalFilterChange,
    createColumnFiltersHandler,
    updateUrl
  } = useDataTableUrlState({
    defaultSort: 'submitted_at.desc',
    filterKeys: FILTER_KEYS,
    sortMap: {
      referenceNo: 'name',
      partnerName: 'partner_id',
      submittedAt: 'submitted_at'
    }
  })

  const searchParams = useSearchParams()
  const dateFrom = searchParams.get('date_from') || ''
  const dateTo = searchParams.get('date_to') || ''

  const statusFilter = columnFilters.find((f) => f.id === 'status')?.value as string[] | undefined
  const kindFilter = columnFilters.find((f) => f.id === 'submission_type')?.value as string[] | undefined

  const { data, isLoading, isFetching } = useSubmissions({
    page,
    perPage,
    search,
    statuses: statusFilter?.length ? (statusFilter as (typeof STATE_FILTERS)[number][]) : undefined,
    kinds: kindFilter?.length ? (kindFilter as (typeof KIND_FILTERS)[number][]) : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    order: orderOdoo
  })

  const records = data?.items ?? []
  const totalCount = data?.total ?? 0

  const [reviewOpen, setReviewOpen] = useState(false)
  const [selected, setSelected] = useState<SubmissionRecord | null>(null)

  const handleReview = useCallback((item: SubmissionRecord) => {
    setSelected(item)
    setReviewOpen(true)
  }, [])

  const columns = useMemo(() => getSubmissionColumns({ t, locale, onReview: handleReview }), [t, locale, handleReview])

  const filters = useMemo(
    () => [
      {
        columnId: 'status',
        title: t('filters.status'),
        options: STATE_FILTERS.map((value) => ({ label: t(`table.states.${value}`), value }))
      },
      {
        columnId: 'submission_type',
        title: t('filters.submissionType'),
        options: KIND_FILTERS.map((value) => ({ label: t(`table.kinds.${value}`), value }))
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

  const handleDateChange = useCallback(
    (key: 'date_from' | 'date_to', value: string) => {
      updateUrl({ [key]: value || undefined, page: 1 })
    },
    [updateUrl]
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground text-xs">{t('filters.dateFrom')}</span>
          <Input type="date" value={dateFrom} onChange={(event) => handleDateChange('date_from', event.target.value)} className="h-7 w-36 text-xs" />
          <span className="text-muted-foreground mx-1 text-xs">{t('filters.dateTo')}</span>
          <Input type="date" value={dateTo} onChange={(event) => handleDateChange('date_to', event.target.value)} className="h-7 w-36 text-xs" />
        </div>
      </div>

      <DataTable
        table={table}
        showSkeleton={showSkeleton}
        isUpdating={isUpdating}
        onReset={resetFilters}
        filters={filters}
        emptyMessage={t('table.emptyState')}
      />

      {selected && <SubmissionReviewDialog open={reviewOpen} onOpenChange={setReviewOpen} submission={selected} />}
    </div>
  )
}
