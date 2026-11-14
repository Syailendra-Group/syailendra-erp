'use client'

import { ImageViewer } from '@/components/image/image-viewer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { ReactElement, ReactNode } from 'react'

export interface PillTabItem<T extends string | number> {
  id: T
  label: ReactNode
  sublabel?: ReactNode
  badge?: ReactNode
  imageSrc?: string | null
  fallbackText?: string
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
    <div className={cn('bg-muted/40 flex w-full flex-wrap gap-2 rounded-xl border p-2', className)}>
      {items.map((item) => {
        const isActive = item.id === value
        const hasAvatar = item.imageSrc !== undefined || item.fallbackText !== undefined

        return (
          <Button
            key={String(item.id)}
            type="button"
            variant={isActive ? 'default' : 'ghost'}
            onClick={() => onValueChange(item.id)}
            className={cn('min-w-25 flex-1 justify-center gap-2.5 font-semibold', itemClassName)}
          >
            {hasAvatar && (
              <div
                className={cn(
                  'flex aspect-square size-5.5 shrink-0 items-center justify-center overflow-hidden rounded-md border',
                  isActive ? 'border-white/30' : 'border-border/50'
                )}
              >
                <ImageViewer
                  src={item.imageSrc}
                  alt={typeof item.label === 'string' ? item.label : String(item.id)}
                  fallbackText={item.fallbackText}
                  disabled
                  objectFit="contain"
                  className={cn('size-full text-[10px]', isActive && 'bg-white/20 text-white')}
                />
              </div>
            )}

            <span className="truncate">{item.label}</span>
            {item.sublabel && <span className="hidden truncate text-xs font-normal opacity-80 xl:inline">- {item.sublabel}</span>}
            {item.badge}
          </Button>
        )
      })}
    </div>
  )
}
