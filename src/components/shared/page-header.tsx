'use client'

import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import type { ComponentType, ReactElement, ReactNode } from 'react'

export interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  icon?: ComponentType<{ className?: string }>
  showBack?: boolean
  backHref?: string
  onBack?: () => void
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
  onBack,
  titleBadge,
  statusBadge,
  titleAdditions,
  actions,
  className
}: PageHeaderProps): ReactElement {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backHref) {
      router.push(backHref)
    }
  }

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex items-center gap-3">
        {showBack && (
          <Button type="button" variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        <div>
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

          {description && <p className="text-muted-foreground mt-1 text-xs sm:text-sm">{description}</p>}
        </div>
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
