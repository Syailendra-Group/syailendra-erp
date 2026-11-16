'use client'

import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

import type { SwitchFieldProps } from '@/types/components/switch-field'
import type { ReactElement } from 'react'

export function SwitchField({
  label,
  hint,
  checked,
  onCheckedChange,
  disabled = false,
  variant = 'inline',
  icon: Icon,
  className,
  id,
  ariaLabel
}: SwitchFieldProps): ReactElement {
  const control = <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} aria-label={ariaLabel} />

  if (variant === 'card') {
    return (
      <div className={cn('flex items-center justify-between rounded-md border p-3', className)}>
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="text-primary size-4" /> : null}
          <div className="space-y-0.5">
            <p className="text-xs font-medium">{label}</p>
            {hint ? <p className="text-muted-foreground text-[11px]">{hint}</p> : null}
          </div>
        </div>
        {control}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-between gap-2', className)}>
      <div className="space-y-0.5">
        <p className="text-xs font-medium">{label}</p>
        {hint ? <p className="text-muted-foreground text-[11px]">{hint}</p> : null}
      </div>
      {control}
    </div>
  )
}
