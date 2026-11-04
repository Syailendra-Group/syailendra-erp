'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Check, ChevronsUpDown, Loader2, PlusCircle, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import type { MultiSelectFormProps, SelectFormProps, SelectOption, SingleSelectFormProps } from '@/types/components/select'
import type { MouseEvent, ReactElement, UIEvent } from 'react'

export type { MultiSelectFormProps, SelectFormProps, SelectOption, SingleSelectFormProps } from '@/types/components/select'

const CHUNK_SIZE = 50

export function SelectForm<T extends string = string>(props: SelectFormProps<T>): ReactElement {
  const {
    items,
    placeholder,
    searchPlaceholder,
    emptyText,
    disabled = false,
    clearable = false,
    className,
    popoverWidth,
    addNewAction = true,
    addNewHref,
    addNewLabel,
    onAddNewClick,
    hasMore: externalHasMore,
    isLoadingMore = false,
    onLoadMore: externalOnLoadMore,
    onSearchChange
  } = props

  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [renderedCount, setRenderedCount] = useState(CHUNK_SIZE)
  const tCommon = useTranslations('common')
  const tSelect = useTranslations('common.select')

  const isMultiple = props.multiple === true
  const singleValue = !isMultiple ? ((props as SingleSelectFormProps<T>).value ?? (props as SingleSelectFormProps<T>).defaultValue) : undefined
  const multiValue = isMultiple ? ((props as MultiSelectFormProps<T>).value ?? (props as MultiSelectFormProps<T>).defaultValue ?? []) : []

  const itemMap = useMemo(() => {
    const map = new Map<string, SelectOption<T>>()
    items.forEach((item) => map.set(item.value, item))
    return map
  }, [items])

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items
    const q = searchQuery.toLowerCase().trim()
    return items.filter((i) => i.label.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q)))
  }, [items, searchQuery])

  const internalHasMore = filteredItems.length > renderedCount
  const visibleItems = useMemo(() => {
    if (externalHasMore !== undefined) return items
    return filteredItems.slice(0, renderedCount)
  }, [items, filteredItems, renderedCount, externalHasMore])

  const handleSelect = (val: T) => {
    if (isMultiple) {
      const current = multiValue as T[]
      const next = current.includes(val) ? current.filter((item) => item !== val) : [...current, val]
      ;(props as MultiSelectFormProps<T>).onValueChange?.(next)
    } else {
      ;(props as SingleSelectFormProps<T>).onValueChange?.(val)
      setOpen(false)
    }
  }

  const handleClear = (e: MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation()
    if (isMultiple) {
      ;(props as MultiSelectFormProps<T>).onValueChange?.([])
    } else {
      ;(props as SingleSelectFormProps<T>).onValueChange?.('' as T)
    }
  }

  const handleRemoveItem = (val: T, e: MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation()
    if (isMultiple) (props as MultiSelectFormProps<T>).onValueChange?.((multiValue as T[]).filter((item) => item !== val))
  }

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setRenderedCount(CHUNK_SIZE)
    onSearchChange?.(val)
  }

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 25) {
      if (externalOnLoadMore && externalHasMore) {
        externalOnLoadMore()
      } else if (internalHasMore) {
        setRenderedCount((prev) => prev + CHUNK_SIZE)
      }
    }
  }

  const selectedSingleItem = singleValue ? itemMap.get(singleValue) : undefined
  const hasAddAction = addNewAction && Boolean(addNewHref || onAddNewClick)
  const isTyping = Boolean(searchQuery.trim())
  const actionButtonText = isTyping ? tCommon('actions.createOption', { name: searchQuery.trim() }) : addNewLabel || tCommon('actions.addNew')

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) {
          setSearchQuery('')
          setRenderedCount(CHUNK_SIZE)
          onSearchChange?.('')
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-9 w-full min-w-0 rounded-md border bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm',
            disabled && 'cursor-not-allowed opacity-50',
            className
          )}
        >
          <div className="flex flex-1 flex-wrap items-center gap-1.5 overflow-hidden text-left">
            {isMultiple ? (
              multiValue.length > 0 ? (
                multiValue.map((val: T) => {
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

      <PopoverContent
        className={cn('flex flex-col overflow-hidden p-0 shadow-md', popoverWidth || 'w-(--radix-popover-trigger-width) min-w-55')}
        align="start"
      >
        <Command shouldFilter={false} className="flex max-h-72 w-full flex-col">
          <CommandInput
            placeholder={searchPlaceholder || tSelect('searchPlaceholder')}
            value={searchQuery}
            onValueChange={handleSearchChange}
            className="h-8 shrink-0 text-xs"
          />

          <CommandList onScroll={handleScroll} className="max-h-52 flex-1 overflow-y-auto">
            <CommandEmpty className="text-muted-foreground px-3 py-3 text-center text-xs">
              <p>{emptyText || tSelect('noResults')}</p>
            </CommandEmpty>

            <CommandGroup>
              {visibleItems.map((item) => {
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

            {(isLoadingMore || internalHasMore) && (
              <div className="text-muted-foreground flex items-center justify-center gap-1.5 py-2 text-xs">
                <Loader2 className="text-primary size-3.5 animate-spin" />
                <span>{tSelect('loadingMore')}</span>
              </div>
            )}
          </CommandList>

          {/* Fixed Sticky Footer for Add Action */}
          {hasAddAction && (
            <div className="border-border bg-card/95 sticky bottom-0 z-10 shrink-0 border-t p-1.5 shadow-xs backdrop-blur-xs">
              {addNewHref ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary hover:bg-muted/70 h-8 w-full cursor-pointer justify-start gap-2 text-xs font-medium"
                  asChild
                >
                  <Link href={addNewHref} onClick={() => setOpen(false)}>
                    <PlusCircle className="size-3.5" />
                    <span className="truncate">{actionButtonText}</span>
                  </Link>
                </Button>
              ) : onAddNewClick ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary hover:bg-muted/70 h-8 w-full cursor-pointer justify-start gap-2 text-xs font-medium"
                  onClick={() => {
                    setOpen(false)
                    onAddNewClick?.()
                  }}
                >
                  <PlusCircle className="size-3.5" />
                  <span className="truncate">{actionButtonText}</span>
                </Button>
              ) : null}
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
