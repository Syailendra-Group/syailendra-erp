'use client'

import { OTPInput } from 'input-otp'
import { Controller } from 'react-hook-form'

import { cn } from '@/lib/utils'

import type { FieldPath, FieldValues } from 'react-hook-form'

export interface OtpInputProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>
  length?: number
  disabled?: boolean
  className?: string
}

export function OtpInput<TFieldValues extends FieldValues>({ name, length = 6, disabled = false, className, ...props }: OtpInputProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      render={({ field }) => (
        <OTPInput
          {...props}
          value={field.value ?? ''}
          onChange={field.onChange}
          inputMode="numeric"
          maxLength={length}
          disabled={disabled}
          className={cn(
            'flex items-center gap-1.5 font-mono text-base',
            'border-input bg-background rounded-lg border px-3 py-2',
            'focus-within:ring-ring focus-within:ring-1',
            'disabled:pointer-events-none disabled:opacity-50',
            className
          )}
          render={({ slots }) => (
            <div className="flex items-center gap-1.5">
              {slots.map((slot, index) => (
                <input key={index} {...slot} className="w-8 text-center" />
              ))}
            </div>
          )}
        />
      )}
    />
  )
}
