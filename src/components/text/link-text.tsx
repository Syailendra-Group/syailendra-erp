'use client'

import { type ElementType, type ReactElement, type ReactNode } from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface LinkTextProps {
  href?: string | null
  children?: ReactNode
  icon?: ElementType
  external?: boolean
  mono?: boolean
  className?: string
  iconClassName?: string
  fallback?: string
  title?: string
}

export function LinkText({
  href,
  children,
  icon: Icon,
  external = false,
  mono = false,
  className,
  iconClassName,
  fallback = '-',
  title
}: LinkTextProps): ReactElement {
  if (!href || !children) {
    return <span className="text-muted-foreground text-xs">{fallback}</span>
  }

  const content = (
    <>
      {Icon && <Icon className={cn('size-3 text-primary shrink-0', iconClassName)} />}
      <span>{children}</span>
      {external && <ExternalLink className="size-2.5 opacity-60 shrink-0" />}
    </>
  )

  const commonClasses = cn(
    'hover:text-primary inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors',
    mono && 'font-mono',
    className
  )

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" title={title} className={commonClasses}>
        {content}
      </a>
    )
  }

  return (
    <Link href={href} title={title} className={commonClasses}>
      {content}
    </Link>
  )
}
