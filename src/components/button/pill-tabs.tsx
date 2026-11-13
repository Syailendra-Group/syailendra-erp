'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { ReactElement, ReactNode } from 'react'

export interface PillTabItem<T extends string | number> {
  id: T
  label: ReactNode
  sublabel?: ReactNode
  badge?: ReactNode
}

export interface PillTabsProps<T extends string | number> {
  items: PillTabItem<T>[]
  value?: T
  onValueChange: (value: T) => void
  className?: string
  itemClassName?: string
}

export function PillTabs<T extends string | number>({ items, value, onValueChange, className, itemClassName }: PillTabsProps<T>): ReactElement {
  return (
    <div className={cn('bg-muted/40 flex flex-wrap gap-2 rounded-xl border p-2', className)}>
      {items.map((item) => {
        const isActive = item.id === value
        return (
          <Button
            key={String(item.id)}
            type="button"
            variant={isActive ? 'default' : 'ghost'}
            onClick={() => onValueChange(item.id)}
            className={cn('gap-2 font-semibold', itemClassName)}
          >
            <span>{item.label}</span>
            {item.sublabel && <span className="hidden text-xs font-normal opacity-80 md:inline">- {item.sublabel}</span>}
            {item.badge}
          </Button>
        )
      })}
    </div>
  )
}
