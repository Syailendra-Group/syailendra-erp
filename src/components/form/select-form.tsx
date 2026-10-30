'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import type { ComponentType, ReactElement } from 'react'

export interface SelectOption<T extends string = string> {
  value: T
  label: string
  description?: string
  image?: string
  icon?: ComponentType<{ className?: string }>
  disabled?: boolean
}

interface BaseSelectFormProps<T extends string = string> {
  items: SelectOption<T>[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  clearable?: boolean
  className?: string
  popoverWidth?: string
}

export interface SingleSelectFormProps<T extends string = string> extends BaseSelectFormProps<T> {
  multiple?: false
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
}

export interface MultiSelectFormProps<T extends string = string> extends BaseSelectFormProps<T> {
  multiple: true
  value?: T[]
  defaultValue?: T[]
  onValueChange?: (value: T[]) => void
}

export type SelectFormProps<T extends string = string> = SingleSelectFormProps<T> | MultiSelectFormProps<T>

export function SelectForm<T extends string = string>(props: SelectFormProps<T>): ReactElement {
  const { items, placeholder, searchPlaceholder, emptyText, disabled = false, clearable = false, className, popoverWidth } = props

  const [open, setOpen] = useState(false)
  const tCommon = useTranslations('common')

  const isMultiple = props.multiple === true
  const singleValue = !isMultiple ? ((props as SingleSelectFormProps<T>).value ?? (props as SingleSelectFormProps<T>).defaultValue) : undefined
  const multiValue = isMultiple ? ((props as MultiSelectFormProps<T>).value ?? (props as MultiSelectFormProps<T>).defaultValue ?? []) : []

  const itemMap = useMemo(() => {
    const map = new Map<string, SelectOption<T>>()
    items.forEach((item) => map.set(item.value, item))
    return map
  }, [items])

  const handleSelect = (val: T) => {
    if (isMultiple) {
      const current = multiValue as T[]
      const exists = current.includes(val)
      const next = exists ? current.filter((item) => item !== val) : [...current, val]
      ;(props as MultiSelectFormProps<T>).onValueChange?.(next)
    } else {
      ;(props as SingleSelectFormProps<T>).onValueChange?.(val)
      setOpen(false)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isMultiple) {
      ;(props as MultiSelectFormProps<T>).onValueChange?.([])
    } else {
      ;(props as SingleSelectFormProps<T>).onValueChange?.('' as T)
    }
  }

  const handleRemoveItem = (val: T, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isMultiple) {
      const next = (multiValue as T[]).filter((item) => item !== val)
      ;(props as MultiSelectFormProps<T>).onValueChange?.(next)
    }
  }

  const selectedSingleItem = singleValue ? itemMap.get(singleValue) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-auto min-h-8 w-full justify-between rounded-md bg-transparent px-2.5 py-1 text-xs font-normal shadow-xs transition-colors hover:bg-transparent focus-visible:ring-3',
            disabled && 'cursor-not-allowed opacity-50',
            className
          )}
        >
          <div className="flex flex-1 flex-wrap items-center gap-1.5 overflow-hidden text-left">
            {isMultiple ? (
              multiValue.length > 0 ? (
                multiValue.map((val) => {
                  const item = itemMap.get(val)
                  const Icon = item?.icon
                  return (
                    <Badge
                      key={val}
                      variant="secondary"
                      className="bg-muted text-foreground flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-medium"
                    >
                      {item?.image ? (
                        <Image src={item.image} alt={item.label} width={14} height={14} className="size-3.5 rounded-full object-cover" />
                      ) : Icon ? (
                        <Icon className="text-primary size-3" />
                      ) : null}
                      <span>{item?.label || val}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => handleRemoveItem(val, e)}
                        className="hover:text-destructive text-muted-foreground ml-0.5 cursor-pointer rounded-xs"
                      >
                        <X className="size-3" />
                      </span>
                    </Badge>
                  )
                })
              ) : (
                <span className="text-muted-foreground text-xs">{placeholder || tCommon('actions.selectOption')}</span>
              )
            ) : selectedSingleItem ? (
              <div className="flex items-center gap-2 truncate">
                {selectedSingleItem.image ? (
                  <Image
                    src={selectedSingleItem.image}
                    alt={selectedSingleItem.label}
                    width={16}
                    height={16}
                    className="size-4 rounded-full object-cover"
                  />
                ) : selectedSingleItem.icon ? (
                  <selectedSingleItem.icon className="text-primary size-3.5 shrink-0" />
                ) : null}
                <span className="truncate text-xs font-medium">{selectedSingleItem.label}</span>
              </div>
            ) : (
              <span className="text-muted-foreground text-xs">{placeholder || tCommon('actions.selectOption')}</span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {clearable && ((!isMultiple && singleValue) || (isMultiple && multiValue.length > 0)) && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                className="hover:text-foreground text-muted-foreground cursor-pointer rounded-xs p-0.5"
              >
                <X className="size-3.5" />
              </span>
            )}
            <ChevronsUpDown className="text-muted-foreground size-3.5 opacity-60" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className={cn('p-0 shadow-md', popoverWidth || 'w-[var(--radix-popover-trigger-width)] min-w-[200px]')} align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder || tCommon('actions.search')} className="h-8 text-xs" />
          <CommandList className="max-h-60">
            <CommandEmpty className="text-muted-foreground py-2 text-center text-xs">{emptyText || tCommon('table.noResults')}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => {
                const isSelected = isMultiple ? (multiValue as T[]).includes(item.value) : singleValue === item.value
                const Icon = item.icon
                return (
                  <CommandItem
                    key={item.value}
                    value={`${item.label} ${item.description || ''}`}
                    disabled={item.disabled}
                    onSelect={() => handleSelect(item.value)}
                    className="flex cursor-pointer items-center justify-between gap-2 px-2 py-1.5 text-xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {item.image ? (
                        <Image src={item.image} alt={item.label} width={20} height={20} className="size-5 shrink-0 rounded-full object-cover" />
                      ) : Icon ? (
                        <Icon className="text-primary size-4 shrink-0" />
                      ) : null}
                      <div className="flex flex-col truncate">
                        <span className={cn('truncate text-xs', isSelected && 'text-primary font-semibold')}>{item.label}</span>
                        {item.description && <span className="text-muted-foreground truncate text-[10px] leading-tight">{item.description}</span>}
                      </div>
                    </div>
                    <Check className={cn('text-primary size-3.5 shrink-0 transition-opacity', isSelected ? 'opacity-100' : 'opacity-0')} />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
