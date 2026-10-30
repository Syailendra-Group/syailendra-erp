'use client'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import type { ReactElement, ReactNode } from 'react'

export interface FormFieldWrapperProps {
  id?: string
  label: string
  required?: boolean
  error?: string
  className?: string
  children: ReactNode
}

export function FormFieldWrapper({ id, label, required = false, error, className, children }: FormFieldWrapperProps): ReactElement {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id} className="text-xs font-semibold">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-destructive text-[11px] font-medium">{error}</p>}
    </div>
  )
}
