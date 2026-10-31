'use client'

import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import type { ReactElement } from 'react'

export interface DatePickerProps {
  selected?: Date
  onSelect: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({ selected, onSelect, placeholder, className, disabled = false }: DatePickerProps): ReactElement {
  const tCommon = useTranslations('common.actions')

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          data-empty={!selected}
          className={cn('data-[empty=true]:text-muted-foreground w-full justify-start text-start text-xs font-normal', className)}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-70" />
          {selected ? format(selected, 'PPP') : <span>{placeholder || tCommon('pickDate')}</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={selected} onSelect={onSelect} />
      </PopoverContent>
    </Popover>
  )
}
