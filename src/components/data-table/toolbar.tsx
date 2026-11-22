'use client'

import { type ReactElement, type ReactNode } from 'react'
import { type Table } from '@tanstack/react-table'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { DateRangeFilter } from './date-range-filter'
import { DataTableFacetedFilter } from './faceted-filter'
import { DataTableViewOptions } from './view-options'

export interface DataTableFilterField {
  columnId: string
  title: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  selectedValues?: string[]
  onFilterChange?: (values: string[] | undefined) => void
}

export interface DataTableDateRangeConfig {
  /** Off by default: a table opts in explicitly. */
  enabled?: boolean
  from?: string
  to?: string
  onChange: (next: { from?: string; to?: string }) => void
}

export interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchPlaceholder?: string
  filters?: DataTableFilterField[]
  dateRange?: DataTableDateRangeConfig
  onReset?: () => void
  children?: ReactNode
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder,
  filters = [],
  dateRange,
  onReset,
  children
}: DataTableToolbarProps<TData>): ReactElement {
  const tCommon = useTranslations('common.actions')
  const dateRangeEnabled = Boolean(dateRange && dateRange.enabled !== false)
  const hasDateRange = dateRangeEnabled && Boolean(dateRange?.from || dateRange?.to)
  const isFiltered = table.getState().columnFilters.length > 0 || !!table.getState().globalFilter || hasDateRange

  return (
    <div className="flex flex-col gap-2.5">
      {dateRangeEnabled && dateRange ? (
        <div className="flex w-full items-center">
          <DateRangeFilter value={{ from: dateRange.from, to: dateRange.to }} onChange={dateRange.onChange} />
        </div>
      ) : null}

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            placeholder={searchPlaceholder || tCommon('search')}
            value={(table.getState().globalFilter as string) ?? ''}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="dark:bg-card h-8 w-full bg-white text-xs sm:w-45 lg:w-62.5"
          />

          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId)
            const filterState = table.getState().columnFilters.find((f) => f.id === filter.columnId)
            const selectedValues = filter.selectedValues ?? (filterState?.value as string[])

            const handleFilterChange = (vals: string[] | undefined) => {
              if (filter.onFilterChange) {
                filter.onFilterChange(vals)
              } else if (column) {
                column.setFilterValue(vals)
              } else {
                table.setColumnFilters((prev) => {
                  const next = prev.filter((f) => f.id !== filter.columnId)
                  if (vals && vals.length > 0) {
                    return [...next, { id: filter.columnId, value: vals }]
                  }
                  return next
                })
              }
            }

            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
                selectedValues={selectedValues}
                onFilterChange={handleFilterChange}
              />
            )
          })}

          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => {
                table.resetColumnFilters()
                table.setGlobalFilter('')
                if (dateRangeEnabled) dateRange?.onChange({})
                onReset?.()
              }}
              className="h-8 px-2 text-xs lg:px-3"
            >
              {tCommon('reset')}
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {children}
          <DataTableViewOptions table={table} />
        </div>
      </div>
    </div>
  )
}
