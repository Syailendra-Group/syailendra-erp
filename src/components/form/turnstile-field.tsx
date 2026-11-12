'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useController } from 'react-hook-form'

import { TurnstileWidget } from '@/components/form/turnstile-widget'
import { cn } from '@/lib/utils'

import type { ReactElement } from 'react'
import type { Control, FieldValues, Path } from 'react-hook-form'

export interface TurnstileFieldProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>
  name?: Path<TFieldValues>
  action?: string
  className?: string
}

/**
 * TurnstileField — Standardized, zero-boilerplate Cloudflare Turnstile form integration
 *
 * Encapsulates react-hook-form controller wiring, validation error surfacing,
 * and automated widget reset when a form submission cycle fails.
 */
export function TurnstileField<TFieldValues extends FieldValues = FieldValues>({
  control,
  name = 'turnstileToken' as Path<TFieldValues>,
  action = 'login',
  className
}: TurnstileFieldProps<TFieldValues>): ReactElement {
  const {
    field,
    fieldState: { error },
    formState: { submitCount, isSubmitSuccessful, isSubmitting }
  } = useController({
    control,
    name
  })

  const prevSubmitCountRef = useRef(submitCount)
  const resetTrigger = !isSubmitting && !isSubmitSuccessful ? submitCount : 0

  // Clear stale Turnstile token whenever a submitted cycle completes without success
  useEffect(() => {
    if (!isSubmitting && submitCount > prevSubmitCountRef.current) {
      if (!isSubmitSuccessful) {
        field.onChange('')
      }
      prevSubmitCountRef.current = submitCount
    }
  }, [field, isSubmitting, isSubmitSuccessful, submitCount])

  const handleVerify = useCallback(
    (token: string) => {
      field.onChange(token)
    },
    [field]
  )

  const handleExpire = useCallback(() => {
    field.onChange('')
  }, [field])

  return (
    <div className={cn('space-y-1', className)}>
      <TurnstileWidget action={action} onVerify={handleVerify} onExpire={handleExpire} resetTrigger={resetTrigger} />
      {error?.message && (
        <p className="text-destructive text-center text-xs font-medium" role="alert">
          {error.message}
        </p>
      )}
    </div>
  )
}
