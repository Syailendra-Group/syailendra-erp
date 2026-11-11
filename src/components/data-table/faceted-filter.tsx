'use client'

import { useMemo, useState } from 'react'
import { Check, Loader2, PlusCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import type { Column } from '@tanstack/react-table'
import type { ComponentType, ReactElement, UIEvent } from 'react'

export interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: {
    label: string
    value: string
    icon?: ComponentType<{ className?: string }>
  }[]
  selectedValues?: string[]
  onFilterChange?: (values: string[] | undefined) => void
}

const CHUNK_SIZE = 50

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  selectedValues: externalSelectedValues,
  onFilterChange
}: DataTableFacetedFilterProps<TData, TValue>): ReactElement | null {
  const tTable = useTranslations('common.table')
  const tSelect = useTranslations('common.select')
  const facets = column?.getFacetedUniqueValues()

  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [renderedCount, setRenderedCount] = useState(CHUNK_SIZE)

  const currentValues = externalSelectedValues ?? (column?.getFilterValue() as string[]) ?? []
  const selectedValues = new Set(currentValues)

  const handleApplyFilter = (values: string[] | undefined) => {
    if (onFilterChange) {
      onFilterChange(values)
    } else if (column) {
      column.setFilterValue(values)
    }
  }

  // Fast In-Memory Filter with Zero cmdk double-filter interference
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options
    const q = searchQuery.toLowerCase().trim()
    return options.filter((option) => option.label.toLowerCase().includes(q))
  }, [options, searchQuery])

  const hasMore = filteredOptions.length > renderedCount
  const visibleOptions = useMemo(() => {
    return filteredOptions.slice(0, renderedCount)
  }, [filteredOptions, renderedCount])

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setRenderedCount(CHUNK_SIZE)
  }

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 30) {
      if (hasMore) {
        setRenderedCount((prev) => prev + CHUNK_SIZE)
      }
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) {
          setSearchQuery('')
          setRenderedCount(CHUNK_SIZE)
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed bg-white text-xs">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.size} {tTable('selected')}
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge variant="secondary" key={option.value} className="rounded-sm px-1 font-normal">
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-0 sm:w-72" align="start">
        <Command shouldFilter={false} className="flex max-h-80 w-full flex-col">
          <CommandInput placeholder={title} value={searchQuery} onValueChange={handleSearchChange} className="h-8 shrink-0 text-xs" />

          <CommandList onScroll={handleScroll} className="max-h-60 flex-1 overflow-y-auto">
            <CommandEmpty className="text-muted-foreground px-3 py-3 text-center text-xs">{tTable('noResults')}</CommandEmpty>

            <CommandGroup>
              {visibleOptions.map((option) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value)
                      } else {
                        selectedValues.add(option.value)
                      }
                      const filterValues = Array.from(selectedValues)
                      handleApplyFilter(filterValues.length ? filterValues : undefined)
                    }}
                    className="cursor-pointer text-xs"
                  >
                    <div
                      className={cn(
                        'border-primary mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border',
                        isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    {option.icon && <option.icon className="text-muted-foreground mr-2 h-4 w-4 shrink-0" />}
                    <span className="truncate">{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">{facets.get(option.value)}</span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>

            {hasMore && (
              <div className="text-muted-foreground flex items-center justify-center gap-1.5 py-1.5 text-[11px]">
                <Loader2 className="text-primary size-3 animate-spin" />
                <span>{tSelect('loadingMore')}</span>
              </div>
            )}

            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />

                <CommandGroup>
                  <CommandItem onSelect={() => handleApplyFilter(undefined)} className="cursor-pointer justify-center text-center text-xs">
                    {tTable('clearFilters')}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
