'use client'

import { Controller } from 'react-hook-form'

import { Input } from '@/components/ui/input'

import { FormFieldWrapper } from './form-field-wrapper'

import type { TextFieldProps } from '@/types/components/form-fields'
import type { ReactElement } from 'react'
import type { FieldValues } from 'react-hook-form'

export function TextField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  mono = false,
  maxLength,
  readOnly = false,
  type = 'text',
  className
}: TextFieldProps<TFieldValues>): ReactElement {
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
            type={type}
            maxLength={maxLength}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={Boolean(fieldState.error)}
            aria-describedby={fieldState.error ? `${name}-error` : undefined}
            className={mono ? 'font-mono' : undefined}
            value={field.value == null ? '' : String(field.value)}
          />
        </FormFieldWrapper>
      )}
    />
  )
}
