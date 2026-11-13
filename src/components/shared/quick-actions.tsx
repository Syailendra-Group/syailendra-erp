'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import type { ElementType, ReactElement } from 'react'

export interface QuickActionItem {
  label: string
  href: string
  icon: ElementType
  variant?: 'outline' | 'default' | 'secondary' | 'ghost'
}

export interface QuickActionsProps {
  items: QuickActionItem[]
  title?: string
  className?: string
}

export function QuickActions({ items, title, className }: QuickActionsProps): ReactElement {
  const tCommon = useTranslations('common')
  const displayTitle = title || tCommon('quickActions.title')
  return (
    <Card className={cn('border-border/60 bg-muted/20 p-3 shadow-xs sm:p-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase sm:text-xs">{displayTitle}</span>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {items.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.label}
                variant={action.variant || 'outline'}
                asChild
                className="cursor-pointer gap-1.5 px-2.5 text-[11px] font-medium sm:sm:px-3 sm:text-xs"
              >
                <Link href={action.href}>
                  <Icon className="size-3.5" />
                  <span>{action.label}</span>
                </Link>
              </Button>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
