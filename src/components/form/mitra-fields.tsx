'use client'

import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import type { ReactElement } from 'react'

type CommonFieldProps = {
  name: string
  label: string
  placeholder?: string
  required?: boolean
  error?: string | null
  className?: string
}

/**
 * form-fields.tsx — Reusable partner-form controls built on @/components/ui/*
 * Syailendra Group ERP (Partner Portal, W2)
 *
 * Owned path (features/mitra). No shared files are modified. Every input uses
 * h-11 (44px) + text-base (>=16px) so touch targets and font sizes meet the
 * mobile-first accessibility rules.
 */
export function MitraTextInput(props: CommonFieldProps & React.InputHTMLAttributes<HTMLInputElement>): ReactElement {
  const { name, label, placeholder, required, error, className, ...rest } = props
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Input id={name} {...field} {...rest} placeholder={placeholder} required={required} className={`h-11 text-base ${className ?? ''}`} />
          <FormMessage>{error}</FormMessage>
        </FormItem>
      )}
    />
  )
}

export function MitraNumberInput(props: CommonFieldProps & React.InputHTMLAttributes<HTMLInputElement>): ReactElement {
  return <MitraTextInput {...props} type="number" inputMode="numeric" />
}

export function MitraUrlInput(props: CommonFieldProps & React.InputHTMLAttributes<HTMLInputElement>): ReactElement {
  return <MitraTextInput {...props} type="url" />
}

export function MitraSelect(props: CommonFieldProps & { options: { value: string; label: string }[] }): ReactElement {
  const { name, label, placeholder, required, error, options, className } = props
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <select
            id={name}
            {...field}
            required={required}
            className={`border-input bg-background h-11 rounded-md border px-3 text-base ${className ?? ''}`}
          >
            {placeholder ? (
              <option value="" disabled>
                {placeholder}
              </option>
            ) : null}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <FormMessage>{error}</FormMessage>
        </FormItem>
      )}
    />
  )
}

export function MitraTextarea(props: CommonFieldProps & { rows?: number }): ReactElement {
  const { name, label, placeholder, required, rows = 3, error, className } = props
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <textarea
            id={name}
            {...field}
            placeholder={placeholder}
            required={required}
            rows={rows}
            className={`border-input bg-background h-11 rounded-md border px-3 py-2 text-base ${className ?? ''}`}
          />
          <FormMessage>{error}</FormMessage>
        </FormItem>
      )}
    />
  )
}

export function MitraCheckbox(props: CommonFieldProps): ReactElement {
  const { name, label, required, error } = props
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-start gap-2">
          <input
            id={name}
            type="checkbox"
            checked={field.value === true}
            onChange={(event) => field.onChange(event.target.checked)}
            required={required}
            className="border-input bg-background mt-1 h-5 w-5 shrink-0 rounded border"
          />
          <FormLabel htmlFor={name} className="text-base leading-none">
            {label}
          </FormLabel>
          <FormMessage>{error}</FormMessage>
        </FormItem>
      )}
    />
  )
}
