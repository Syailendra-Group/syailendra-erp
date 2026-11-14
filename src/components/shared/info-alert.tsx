'use client'

import { AlertCircle, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

import type { ComponentType, ReactElement, ReactNode } from 'react'

export type InfoAlertVariant = 'info' | 'warning' | 'destructive' | 'success'

export interface InfoAlertProps {
  title?: ReactNode
  description?: ReactNode
  icon?: ComponentType<{ className?: string }>
  variant?: InfoAlertVariant
  className?: string
  children?: ReactNode
}

const variantStyles: Record<InfoAlertVariant, { container: string; iconClass: string; defaultIcon: ComponentType<{ className?: string }> }> = {
  info: {
    container: 'border-primary/30 bg-primary/5 text-foreground',
    iconClass: 'text-primary',
    defaultIcon: ShieldCheck
  },
  warning: {
    container: 'border-amber-500/30 bg-amber-500/10 text-foreground dark:border-amber-500/40 dark:bg-amber-950/20',
    iconClass: 'text-amber-600 dark:text-amber-400',
    defaultIcon: AlertTriangle
  },
  destructive: {
    container: 'border-destructive/30 bg-destructive/10 text-destructive dark:border-destructive/40 dark:bg-destructive/20',
    iconClass: 'text-destructive',
    defaultIcon: AlertCircle
  },
  success: {
    container: 'border-emerald-500/30 bg-emerald-500/10 text-foreground dark:border-emerald-500/40 dark:bg-emerald-950/20',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    defaultIcon: CheckCircle2
  }
}

export function InfoAlert({ title, description, icon, variant = 'info', className, children }: InfoAlertProps): ReactElement {
  const currentVariant = variantStyles[variant]
  const IconComponent = icon || currentVariant.defaultIcon

  return (
    <Alert className={cn(currentVariant.container, className)}>
      <IconComponent className={cn('size-4 shrink-0', currentVariant.iconClass)} />
      {title && <AlertTitle className="text-xs font-semibold sm:text-sm">{title}</AlertTitle>}
      {description && <AlertDescription className="text-muted-foreground text-xs leading-relaxed">{description}</AlertDescription>}
      {children}
    </Alert>
  )
}
