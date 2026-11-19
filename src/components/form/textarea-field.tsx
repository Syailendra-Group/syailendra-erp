'use client'

import { Controller } from 'react-hook-form'

import { Textarea } from '@/components/ui/textarea'

import { FormFieldWrapper } from './form-field-wrapper'

import type { TextareaFieldProps } from '@/types/components/form-fields'
import type { ReactElement } from 'react'
import type { FieldValues } from 'react-hook-form'

export function TextareaField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  rows = 3,
  maxLength,
  readOnly,
  className
}: TextareaFieldProps<TFieldValues>): ReactElement {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormFieldWrapper id={name} label={label} required={required} error={fieldState.error?.message} className={className}>
          <Textarea
            {...field}
            id={name}
            name={name}
            rows={rows}
            maxLength={maxLength}
            readOnly={readOnly}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={Boolean(fieldState.error)}
            aria-describedby={fieldState.error ? `${name}-error` : undefined}
            value={field.value == null ? '' : String(field.value)}
          />
        </FormFieldWrapper>
      )}
    />
  )
}
