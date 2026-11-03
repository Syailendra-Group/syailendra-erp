/**
 * table.ts — Centralized Types for Server-Driven DataTable & URL State Hook
 * Syailendra Group ERP
 */

import type { ColumnDef, ColumnFiltersState, PaginationState, SortingState, Table } from '@tanstack/react-table'

export interface UseDataTableUrlStateOptions {
  defaultSort?: string
  defaultPerPage?: number
  filterKeys?: string[]
}

export interface UseDataTableUrlStateReturn {
  page: number
  perPage: number
  search: string
  sort: string
  orderOdoo: string
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
  isUpdating: boolean
  getArrayFilter: (key: string) => string[]
  updateUrl: (updates: Record<string, string | number | undefined | null>) => void
  resetFilters: () => void
  onPaginationChange: (updater: PaginationState | ((old: PaginationState) => PaginationState)) => void
  onSortingChange: (updater: SortingState | ((old: SortingState) => SortingState)) => void
  onGlobalFilterChange: (val: string | number | boolean | null | undefined) => void
  createColumnFiltersHandler: (filterKeys: string[]) => (updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => void
}

export interface UseServerDataTableOptions<TData, TValue = never> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  totalCount: number
  defaultSort?: string
  defaultPerPage?: number
  filterKeys?: string[]
}

export interface UseServerDataTableReturn<TData> {
  table: Table<TData>
  isUpdating: boolean
  resetFilters: () => void
}
