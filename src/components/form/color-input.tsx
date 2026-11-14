'use client'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import type { ReactElement } from 'react'

export interface ColorInputProps {
  id: string
  label: string
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  description?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/

export function ColorInput({
  id,
  label,
  value = '#004e52',
  onChange,
  placeholder = '#004E52',
  description,
  error,
  required = false,
  disabled = false,
  className
}: ColorInputProps): ReactElement {
  const normalizedPickerValue = HEX_COLOR_REGEX.test(value) ? value : '#004e52'

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.trim()
    if (raw && !raw.startsWith('#')) {
      raw = `#${raw}`
    }
    onChange(raw.toUpperCase())
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.toUpperCase())
  }

  return (
    <FormFieldWrapper id={id} label={label} required={required} error={error} className={cn('space-y-1.5', className)}>
      <div className="flex items-center gap-2.5">
        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border shadow-xs transition-transform hover:scale-105">
          <input
            type="color"
            id={`${id}-picker`}
            aria-label={`${label} picker`}
            value={normalizedPickerValue}
            onChange={handleColorChange}
            disabled={disabled}
            className="absolute inset-[-8px] size-[calc(100%+16px)] cursor-pointer appearance-none border-0 bg-transparent p-0"
          />
        </div>

        <Input
          id={id}
          value={value}
          onChange={handleTextChange}
          placeholder={placeholder}
          maxLength={7}
          disabled={disabled}
          className="font-mono text-xs uppercase"
        />
      </div>

      {description && <p className="text-muted-foreground text-[11px] leading-relaxed">{description}</p>}
    </FormFieldWrapper>
  )
}
