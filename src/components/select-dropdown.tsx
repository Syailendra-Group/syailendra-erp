'use client'

import { Loader } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

import type { ReactElement } from 'react'

export interface SelectItemOption {
  label: string
  value: string
}

export interface SelectDropdownProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  isPending?: boolean
  items?: SelectItemOption[]
  disabled?: boolean
  className?: string
}

export function SelectDropdown({
  defaultValue,
  value,
  onValueChange,
  isPending = false,
  items = [],
  placeholder,
  disabled = false,
  className
}: SelectDropdownProps): ReactElement {
  const tCommon = useTranslations('common.actions')

  return (
    <Select value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled || isPending}>
      <SelectTrigger className={cn('text-xs', className)}>
        <SelectValue placeholder={placeholder || tCommon('selectOption')} />
      </SelectTrigger>
      <SelectContent>
        {isPending ? (
          <SelectItem disabled value="loading" className="h-10 text-xs">
            <div className="flex items-center justify-center gap-2">
              <Loader className="h-3.5 w-3.5 animate-spin" />
              <span>{tCommon('loading')}</span>
            </div>
          </SelectItem>
        ) : (
          items.map((item) => (
            <SelectItem key={item.value} value={item.value} className="text-xs">
              {item.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
