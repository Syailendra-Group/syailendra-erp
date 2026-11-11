import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import type { VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithoutRef, ReactElement } from 'react'

export const dataBadgeVariants = cva('inline-flex items-center font-semibold transition-colors border select-none rounded-md', {
  variants: {
    variant: {
      primary: 'border-primary/20 bg-primary/10 text-primary',
      success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      warning: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
      info: 'border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400',
      destructive: 'border-destructive/20 bg-destructive/10 text-destructive',
      neutral: 'border-border/60 bg-muted/60 text-muted-foreground'
    },
    size: {
      sm: 'text-[10px] px-2 py-0.5',
      default: 'text-xs px-2.5 py-0.5'
    }
  },
  defaultVariants: {
    variant: 'primary',
    size: 'sm'
  }
})

export const statusBadgeVariants = dataBadgeVariants

export interface DataBadgeProps extends Omit<ComponentPropsWithoutRef<'span'>, 'color'>, VariantProps<typeof dataBadgeVariants> {}
export type StatusBadgeProps = DataBadgeProps

export function DataBadge({ children, className, variant, size, ...props }: DataBadgeProps): ReactElement {
  return (
    <span className={cn(dataBadgeVariants({ variant, size }), className)} {...props}>
      {children}
    </span>
  )
}

export const StatusBadge = DataBadge
