import { cn } from '@/lib/utils'

import type { ReactElement, ReactNode } from 'react'

export interface DetailRowProps {
  label: ReactNode
  value?: ReactNode
  children?: ReactNode
  border?: boolean
  mono?: boolean
  className?: string
  labelClassName?: string
  valueClassName?: string
}

export function DetailRow({
  label,
  value,
  children,
  border = true,
  mono = false,
  className,
  labelClassName,
  valueClassName
}: DetailRowProps): ReactElement {
  return (
    <div className={cn('grid grid-cols-3 items-center text-xs', border && 'border-border/40 border-b pb-2', className)}>
      <span className={cn('text-muted-foreground font-medium', labelClassName)}>{label}</span>
      <div className={cn('col-span-2 font-medium', mono && 'font-mono font-semibold', valueClassName)}>{children ?? value}</div>
    </div>
  )
}
