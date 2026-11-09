'use client'

import { useCallback, useMemo, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'

import { usePathname, useRouter } from '@/i18n/navigation'
import { buildTableQueryString, parseArrayParam, serializeArrayParam } from '@/utils'

import type { UseDataTableUrlStateOptions, UseDataTableUrlStateReturn } from '@/types/components/table'
import type { ColumnFiltersState, PaginationState, SortingState } from '@tanstack/react-table'

export function useDataTableUrlState(options: UseDataTableUrlStateOptions = {}): UseDataTableUrlStateReturn {
  const { defaultSort = 'ref.asc', defaultPerPage = 20, filterKeys = [] } = options

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPendingUrl, startTransition] = useTransition()

  // Read parameters directly from URL search params
  const page = Number(searchParams.get('page')) || 1
  const perPage = Number(searchParams.get('per_page')) || defaultPerPage
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || defaultSort

  // Retrieve array filter values from URL search params
  const getArrayFilter = useCallback(
    (key: string): string[] => {
      const val = searchParams.get(key)
      return parseArrayParam(val)
    },
    [searchParams]
  )

  // Synchronize state changes to URL search params
  const updateUrl = useCallback(
    (updates: Record<string, string | number | undefined | null>) => {
      const query = buildTableQueryString(searchParams, updates)
      const nextUrl = query ? `${pathname}?${query}` : pathname

      startTransition(() => {
        router.replace(nextUrl, { scroll: false })
      })
    },
    [pathname, router, searchParams]
  )

  // Reset table toolbar filters and pagination
  const resetFilters = useCallback(() => {
    startTransition(() => {
      router.replace(pathname, { scroll: false })
    })
  }, [pathname, router])

  // TanStack Table state adapters
  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: Math.max(0, page - 1),
      pageSize: perPage
    }),
    [page, perPage]
  )

  const sorting: SortingState = useMemo(() => {
    const [field = 'ref', desc = 'asc'] = sort.split('.')
    return [{ id: field, desc: desc === 'desc' }]
  }, [sort])

  const columnFilters: ColumnFiltersState = useMemo(() => {
    const filters: ColumnFiltersState = []

    for (const key of filterKeys) {
      if (key === 'active') {
        const statusList = parseArrayParam(searchParams.get('status'))
        if (statusList.length > 0) {
          const mappedValues: string[] = []
          if (statusList.includes('active')) mappedValues.push('true')
          if (statusList.includes('archived')) mappedValues.push('false')
          if (mappedValues.length > 0) {
            filters.push({ id: 'active', value: mappedValues })
          }
        }
      } else {
        const list = parseArrayParam(searchParams.get(key))
        if (list.length > 0) {
          filters.push({ id: key, value: list })
        }
      }
    }

    return filters
  }, [filterKeys, searchParams])

  // Translate table sorting to Odoo ORM order syntax
  const orderOdoo = useMemo(() => {
    const s = sorting[0]
    if (!s) return 'ref asc'
    const col = s.id === 'name' ? 'name' : 'ref'
    return `${col} ${s.desc ? 'desc' : 'asc'}`
  }, [sorting])

  // URL event handler adapters
  const onPaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      updateUrl({
        page: next.pageIndex + 1,
        per_page: next.pageSize !== defaultPerPage ? next.pageSize : undefined
      })
    },
    [defaultPerPage, pagination, updateUrl]
  )

  const onSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      const first = next[0]
      if (first) {
        updateUrl({ sort: `${first.id}.${first.desc ? 'desc' : 'asc'}` })
      } else {
        updateUrl({ sort: undefined })
      }
    },
    [sorting, updateUrl]
  )

  const onGlobalFilterChange = useCallback(
    (val: string | number | boolean | null | undefined) => {
      const query = typeof val === 'string' ? val.trim() : ''
      updateUrl({
        page: 1,
        search: query || undefined
      })
    },
    [updateUrl]
  )

  const createColumnFiltersHandler = useCallback(
    (keys: string[]) => (updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
      const next = typeof updater === 'function' ? updater(columnFilters) : updater
      const updates: Record<string, string | undefined> = { page: '1' }

      for (const key of keys) {
        if (key === 'active') {
          const act = next.find((f) => f.id === 'active')?.value
          const selectedStatuses = Array.isArray(act) ? (act as string[]) : []
          const mappedStatuses: string[] = []
          if (selectedStatuses.includes('true')) mappedStatuses.push('active')
          if (selectedStatuses.includes('false')) mappedStatuses.push('archived')
          updates.status = serializeArrayParam(mappedStatuses)
        } else {
          const filterItem = next.find((f) => f.id === key)?.value
          const selectedValues = Array.isArray(filterItem) ? (filterItem as string[]) : []
          updates[key] = serializeArrayParam(selectedValues)
        }
      }

      updateUrl(updates)
    },
    [columnFilters, updateUrl]
  )

  return {
    page,
    perPage,
    search,
    sort,
    orderOdoo,
    pagination,
    sorting,
    columnFilters,
    isUpdating: isPendingUrl,
    getArrayFilter,
    updateUrl,
    resetFilters,
    onPaginationChange,
    onSortingChange,
    onGlobalFilterChange,
    createColumnFiltersHandler
  }
}
