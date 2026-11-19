'use client'

import { Controller } from 'react-hook-form'

import { Input } from '@/components/ui/input'

import { FormFieldWrapper } from './form-field-wrapper'

import type { NumberFieldProps } from '@/types/components/form-fields'
import type { ReactElement } from 'react'
import type { FieldValues } from 'react-hook-form'

export function NumberField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  step = '1',
  min,
  max,
  className
}: NumberFieldProps<TFieldValues>): ReactElement {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormFieldWrapper id={name} label={label} required={required} error={fieldState.error?.message} className={className}>
          <Input
            {...field}
            id={name}
            name={name}
            type="number"
            step={step}
            min={min}
            max={max}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={Boolean(fieldState.error)}
            aria-describedby={fieldState.error ? `${name}-error` : undefined}
            className="font-mono"
            value={field.value == null ? '' : String(field.value)}
            onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
          />
        </FormFieldWrapper>
      )}
    />
  )
}
