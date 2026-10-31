import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { ComponentType, ReactElement, ReactNode } from 'react'

export interface SectionCardProps {
  title: ReactNode
  description?: ReactNode
  icon?: ComponentType<{ className?: string }>
  children: ReactNode
  contentClassName?: string
  headerActions?: ReactNode
  className?: string
}

export function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  contentClassName,
  headerActions,
  className
}: SectionCardProps): ReactElement {
  return (
    <Card className={cn('flex h-full w-full flex-col', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            {Icon && <Icon className="text-primary size-4 shrink-0" />}
            <span>{title}</span>
          </CardTitle>
          {headerActions}
        </div>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>

      <CardContent className={cn('flex-1', contentClassName)}>{children}</CardContent>
    </Card>
  )
}
