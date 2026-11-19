'use client'

import { useCallback, useMemo, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'

import { usePathname, useRouter } from '@/i18n/navigation'
import { buildTableQueryString, parseArrayParam, serializeArrayParam } from '@/utils'

import type { UseDataTableUrlStateOptions, UseDataTableUrlStateReturn } from '@/types/components/table'
import type { ColumnFiltersState, PaginationState, SortingState } from '@tanstack/react-table'

/** Stable identity map so the memo below never re-runs because of a fresh `{}` literal. */
const EMPTY_SORT_MAP: Record<string, string> = {}

export function useDataTableUrlState(options: UseDataTableUrlStateOptions = {}): UseDataTableUrlStateReturn {
  const { defaultSort = 'id.desc', defaultPerPage = 20, filterKeys = [], sortMap = EMPTY_SORT_MAP } = options

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPendingUrl, startTransition] = useTransition()

  // Read parameters directly from URL search params
  const page = Number(searchParams.get('page')) || 1
  const perPage = Number(searchParams.get('per_page')) || defaultPerPage
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || defaultSort

  // Retrieve array filter values from URL search params with active/status alias support
  const getArrayFilter = useCallback(
    (key: string): string[] => {
      const val = key === 'active' || key === 'status' ? searchParams.get('status') || searchParams.get('active') : searchParams.get(key)
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
    const [rawField, rawDirection = 'asc'] = sort.split('.')
    const field = rawField || defaultSort.split('.')[0] || 'id'
    return [{ id: field, desc: rawDirection === 'desc' }]
  }, [sort, defaultSort])

  const columnFilters: ColumnFiltersState = useMemo(() => {
    const filters: ColumnFiltersState = []

    for (const key of filterKeys) {
      if (key === 'active' || key === 'status') {
        const statusList = parseArrayParam(searchParams.get('status') || searchParams.get('active'))
        if (statusList.length > 0) {
          const mappedValues: string[] = []
          if (statusList.includes('active') || statusList.includes('true')) mappedValues.push('active')
          if (statusList.includes('archived') || statusList.includes('false')) mappedValues.push('archived')
          if (mappedValues.length > 0) {
            filters.push({ id: key, value: mappedValues })
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

  // Translate table sorting to backend ORM order syntax.
  // The column id is used verbatim unless the feature supplies an explicit `sortMap`,
  // so a feature can never leak a field the backend model does not own.
  const orderOdoo = useMemo(() => {
    const [fallbackField = 'id', fallbackDirection = 'asc'] = defaultSort.split('.')
    const active = sorting[0]
    if (!active) {
      return `${fallbackField} ${fallbackDirection === 'desc' ? 'desc' : 'asc'}`
    }
    const field = sortMap[active.id] ?? active.id
    return `${field} ${active.desc ? 'desc' : 'asc'}`
  }, [sorting, defaultSort, sortMap])

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
      // Merge the incoming change over the CURRENT filter state so that changing one
      // faceted filter never writes the other configured filters back to empty.
      const incoming = typeof updater === 'function' ? updater(columnFilters) : updater
      const merged = new Map(columnFilters.map((filter) => [filter.id, filter]))
      incoming.forEach((filter) => merged.set(filter.id, filter))
      const next: ColumnFiltersState = []
      for (const key of keys) {
        const filter = merged.get(key)
        if (filter) next.push(filter)
      }

      const updates: Record<string, string | undefined> = { page: '1' }

      for (const key of keys) {
        if (key === 'active' || key === 'status') {
          const act = next.find((f) => f.id === key)?.value
          const selectedStatuses = Array.isArray(act) ? (act as string[]) : []
          const mappedStatuses: string[] = []
          if (selectedStatuses.includes('active') || selectedStatuses.includes('true')) mappedStatuses.push('active')
          if (selectedStatuses.includes('archived') || selectedStatuses.includes('false')) mappedStatuses.push('archived')
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
