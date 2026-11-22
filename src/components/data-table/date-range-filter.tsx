'use client'

/**
 * date-range-filter.tsx — Reusable inclusive date-range filter for DataTable toolbars.
 * Syailendra Group ERP
 *
 * Rendered above the toolbar's search/filter row. The component is presentation
 * only: the owning table keeps the value in the URL and passes it back in.
 */
import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { enUS, id as idLocale } from 'date-fns/locale'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import type { ReactElement } from 'react'
import type { DateRange } from 'react-day-picker'

export interface DateRangeValue {
  from?: string
  to?: string
}

export interface DateRangeFilterProps {
  value?: DateRangeValue
  onChange: (next: DateRangeValue) => void
  disabled?: boolean
  className?: string
}

function toCalendarDate(value?: string): Date | undefined {
  if (!value) return undefined
  try {
    return parseISO(value)
  } catch {
    return undefined
  }
}

export function DateRangeFilter({ value, onChange, disabled = false, className }: DateRangeFilterProps): ReactElement {
  const t = useTranslations('common.dateRange')
  const locale = useLocale()
  const dateLocale = locale === 'id' ? idLocale : enUS
  const [open, setOpen] = useState(false)

  const from = toCalendarDate(value?.from)
  const to = toCalendarDate(value?.to)
  const hasValue = Boolean(from || to)

  const label = useMemo(() => {
    if (from && to) {
      return `${format(from, 'dd MMM yyyy', { locale: dateLocale })} - ${format(to, 'dd MMM yyyy', { locale: dateLocale })}`
    }
    if (from) {
      return `${format(from, 'dd MMM yyyy', { locale: dateLocale })} - ...`
    }
    return t('placeholder')
  }, [from, to, dateLocale, t])

  const handleSelect = (range: DateRange | undefined) => {
    onChange({
      from: range?.from ? format(range.from, 'yyyy-MM-dd') : undefined,
      to: range?.to ? format(range.to, 'yyyy-MM-dd') : undefined
    })
  }

  const handleClear = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation()
    onChange({})
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={t('label')}
          className={cn(
            'border-input bg-background hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium shadow-xs transition-colors focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50',
            !hasValue && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="size-3.5 shrink-0 opacity-70" />
          <span className="truncate">{label}</span>
          {hasValue ? (
            <span
              role="button"
              tabIndex={0}
              aria-label={t('clear')}
              onClick={handleClear}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  event.stopPropagation()
                  onChange({})
                }
              }}
              className="hover:text-foreground text-muted-foreground ml-0.5 cursor-pointer rounded-xs p-0.5"
            >
              <X className="size-3" />
            </span>
          ) : null}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="range" numberOfMonths={1} autoFocus selected={{ from, to }} onSelect={handleSelect} locale={dateLocale} />
      </PopoverContent>
    </Popover>
  )
}
