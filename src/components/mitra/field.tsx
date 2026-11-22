'use client'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import type { ChangeEvent, ReactElement } from 'react'

interface MitraFieldProps {
  id: string
  label: string
  value: string | number
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  error?: string | null
  disabled?: boolean
}

export function MitraField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  error,
  disabled
}: MitraFieldProps): ReactElement {
  return (
    <FormFieldWrapper id={id} label={label} required={required} error={error ?? undefined} className="space-y-1">
      <Input
        id={id}
        type={type}
        value={value == null ? '' : String(value)}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.currentTarget.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={cn('text-xs', disabled && 'opacity-50')}
      />
    </FormFieldWrapper>
  )
}
