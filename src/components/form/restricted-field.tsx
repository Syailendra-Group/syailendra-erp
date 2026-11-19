'use client'

import { Controller } from 'react-hook-form'

import { FormFieldWrapper } from './form-field-wrapper'
import { RestrictedInput } from './restricted-input'

import type { ReactElement } from 'react'
import type { Control, FieldPathByValue, FieldValues } from 'react-hook-form'

export type RestrictedFieldMode = 'code' | 'username' | 'email'

interface RestrictedFieldOwnProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPathByValue<T, string | null | undefined>
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  maxLength?: number
  readOnly?: boolean
  /** Preset transform: `code` uppercases and strips spaces, `username`/`email` lowercase. */
  mode: RestrictedFieldMode
  className?: string
}

export type RestrictedFieldProps<T extends FieldValues> = RestrictedFieldOwnProps<T>

function modeToProps(mode: RestrictedFieldMode): { lowercase: boolean; uppercase: boolean; noSpaces: boolean } {
  if (mode === 'code') return { lowercase: false, uppercase: true, noSpaces: true }
  if (mode === 'username') return { lowercase: true, uppercase: false, noSpaces: true }
  return { lowercase: true, uppercase: false, noSpaces: false }
}

export function RestrictedField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  maxLength,
  readOnly = false,
  mode,
  className
}: RestrictedFieldProps<TFieldValues>): ReactElement {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormFieldWrapper id={name} label={label} required={required} error={fieldState.error?.message} className={className}>
          <RestrictedInput
            {...field}
            {...modeToProps(mode)}
            id={name}
            name={name}
            maxLength={maxLength}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={Boolean(fieldState.error)}
            aria-describedby={fieldState.error ? `${name}-error` : undefined}
            className="font-mono"
            value={field.value == null ? '' : String(field.value)}
          />
        </FormFieldWrapper>
      )}
    />
  )
}
