import { Archive, Edit2, Eye, RotateCcw, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import type { ComponentType, ReactElement } from 'react'

export type ActionButtonVariant = 'view' | 'edit' | 'archive' | 'restore' | 'delete' | 'custom'

export interface ActionButtonProps {
  variant?: ActionButtonVariant
  icon?: ComponentType<{ className?: string }>
  label: string
  href?: string
  onClick?: () => void
  disabled?: boolean
  className?: string
}

const variantStyles: Record<ActionButtonVariant, string> = {
  view: 'border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-950/40',
  edit: 'border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-900/50 dark:text-amber-400 dark:hover:bg-amber-950/40',
  archive: 'border-destructive/30 text-destructive hover:bg-destructive/10 dark:border-destructive/40 dark:hover:bg-destructive/20',
  delete: 'border-destructive/30 text-destructive hover:bg-destructive/10 dark:border-destructive/40 dark:hover:bg-destructive/20',
  restore: 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-950/40',
  custom: ''
}

const defaultIcons: Record<ActionButtonVariant, ComponentType<{ className?: string }>> = {
  view: Eye,
  edit: Edit2,
  archive: Archive,
  delete: Trash2,
  restore: RotateCcw,
  custom: Eye
}

export function ActionButton({ variant = 'custom', icon, label, href, onClick, disabled = false, className }: ActionButtonProps): ReactElement {
  const IconComponent = icon || defaultIcons[variant]
  const colorClass = variantStyles[variant]

  const buttonContent = (
    <>
      <IconComponent className="size-3.5" />
      <span className="sr-only">{label}</span>
    </>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {href ? (
          <Button asChild variant="outline" size="icon" disabled={disabled} className={cn('size-7 cursor-pointer', colorClass, className)}>
            <Link href={href}>{buttonContent}</Link>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onClick}
            disabled={disabled}
            className={cn('size-7 cursor-pointer', colorClass, className)}
          >
            {buttonContent}
          </Button>
        )}
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="text-xs">{label}</p>
      </TooltipContent>
    </Tooltip>
  )
}
