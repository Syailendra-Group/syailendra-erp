/**
 * icon-text.tsx — Standardized reusable icon and text layout container
 * Syailendra Group ERP
 * Complies with octadev-coding-rules-v83 (Rule 2, 6, 108)
 */

import { type ElementType, type ReactElement, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface IconTextProps {
  icon: ElementType
  children?: ReactNode
  mono?: boolean
  className?: string
  iconClassName?: string
  fallback?: string
}

export function IconText({ icon: Icon, children, mono = false, className, iconClassName, fallback = '-' }: IconTextProps): ReactElement {
  if (!children) {
    return <span className="text-muted-foreground text-xs">{fallback}</span>
  }

  return (
    <div className={cn('flex items-center gap-1.5 text-xs', mono && 'font-mono', className)}>
      <Icon className={cn('text-muted-foreground h-3.5 w-3.5 shrink-0', iconClassName)} />
      <span>{children}</span>
    </div>
  )
}
