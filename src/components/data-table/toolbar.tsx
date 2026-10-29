'use client'

import { type ReactElement, type ReactNode } from 'react'
import { type Table } from '@tanstack/react-table'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
}

export interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchPlaceholder?: string
  filters?: DataTableFilterField[]
  children?: ReactNode
}

export function DataTableToolbar<TData>({ table, searchPlaceholder, filters = [], children }: DataTableToolbarProps<TData>): ReactElement {
  const tCommon = useTranslations('common.actions')
  const isFiltered = table.getState().columnFilters.length > 0 || !!table.getState().globalFilter

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder={searchPlaceholder || tCommon('search')}
          value={(table.getState().globalFilter as string) ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="dark:bg-card h-8 w-[150px] bg-white text-xs lg:w-[250px]"
        />

        {filters.map((filter) => {
          const column = table.getColumn(filter.columnId)
          if (!column) return null
          return <DataTableFacetedFilter key={filter.columnId} column={column} title={filter.title} options={filter.options} />
        })}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter('')
            }}
            className="h-8 bg-white px-2 text-xs lg:px-3"
          >
            {tCommon('reset')}
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {children}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
