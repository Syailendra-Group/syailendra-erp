'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { ElementType, ReactElement } from 'react'

export interface SummaryCardItem {
  title: string
  value: string | number
  subtitle?: string
  icon: ElementType
  color?: string
}

export interface SummaryCardProps {
  item: SummaryCardItem
  className?: string
}

export function SummaryCard({ item, className }: SummaryCardProps): ReactElement {
  const Icon = item.icon

  return (
    <Card className={cn('overflow-hidden p-3 shadow-xs transition-shadow sm:p-4', className)}>
      <CardHeader className="flex flex-row items-center justify-between p-0 pb-1.5 sm:pb-2">
        <CardTitle className="text-muted-foreground truncate text-[11px] font-medium sm:text-xs">{item.title}</CardTitle>
        <div className={cn('rounded-md p-1 sm:p-1.5', item.color ? `${item.color}/10` : 'bg-primary/10')}>
          <Icon className={cn('size-3.5 sm:size-4', item.color || 'text-primary')} />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-lg font-bold tracking-tight sm:text-2xl">{item.value}</div>
        {item.subtitle && <p className="text-muted-foreground mt-0.5 truncate text-[10px] sm:text-xs">{item.subtitle}</p>}
      </CardContent>
    </Card>
  )
}

export interface SummaryCardGridProps {
  items: SummaryCardItem[]
  className?: string
}

export function SummaryCardGrid({ items, className }: SummaryCardGridProps): ReactElement {
  return (
    <div className={cn('grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4', className)}>
      {items.map((item) => (
        <SummaryCard key={item.title} item={item} />
      ))}
    </div>
  )
}
