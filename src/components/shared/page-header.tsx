import { ArrowLeft } from 'lucide-react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import type { ComponentType, ReactElement, ReactNode } from 'react'

export interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  icon?: ComponentType<{ className?: string }>
  showBack?: boolean
  backHref?: string
  backLabel?: string
  titleBadge?: ReactNode
  statusBadge?: ReactNode
  titleAdditions?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  showBack = false,
  backHref,
  backLabel = 'Back',
  titleBadge,
  statusBadge,
  titleAdditions,
  actions,
  className
}: PageHeaderProps): ReactElement {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="space-y-1">
        {showBack && backHref && (
          <Link
            href={backHref}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>{backLabel}</span>
          </Link>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          {Icon && (
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              <Icon className="size-4 sm:size-5" />
            </div>
          )}
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
          {titleBadge}
          {statusBadge}
          {titleAdditions}
        </div>

        {description && <p className="text-muted-foreground text-xs sm:text-sm">{description}</p>}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
