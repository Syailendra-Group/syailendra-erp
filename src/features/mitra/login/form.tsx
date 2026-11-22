'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { LogIn } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { partnerLoginAction } from '@/actions/auth/partner/auth.action'
import { LoadingButton } from '@/components/button/loading-button'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { PasswordInput } from '@/components/form/password-input'
import { TextField } from '@/components/form/text-field'
import { TurnstileField } from '@/components/form/turnstile-field'
import { useRouter } from '@/i18n/navigation'
import { getPartnerLoginSchema } from '@/schemas/mitra/auth-schema'

import type { PartnerLoginFormValues } from '@/schemas/mitra/auth-schema'
import type { PartnerAuthErrorCode } from '@/types/scm/partner'
import type { SchemaTranslator } from '@/utils/schema-helper'
import type { ReactElement } from 'react'
import type { SubmitHandler } from 'react-hook-form'

function serverErrorMessage(error: PartnerAuthErrorCode, retryAfterSeconds: number | undefined, t: SchemaTranslator): string {
  switch (error) {
    case 'rate_limited':
      return t('errors.rateLimited', { seconds: retryAfterSeconds ?? 0 })
    case 'invalid_credentials':
      return t('errors.invalidCredentials')
    case 'locked':
      return t('errors.locked')
    case 'turnstile_failed':
      return t('errors.turnstileFailed')
    case 'captcha_misconfigured':
      return t('errors.captchaMisconfigured')
    case 'service_unavailable':
      return t('errors.serviceUnavailable')
    default:
      return t('errors.invalidInput')
  }
}

export function PartnerLoginForm(): ReactElement {
  const t = useTranslations('mitra.login')
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<PartnerLoginFormValues>({
    resolver: zodResolver(getPartnerLoginSchema(t)),
    defaultValues: { accessCode: '', pin: '', turnstileToken: '' }
  })

  const onSubmit: SubmitHandler<PartnerLoginFormValues> = async (values) => {
    setIsPending(true)
    try {
      const result = await partnerLoginAction(values)
      if (result.ok) {
        toast.success(t('messages.loginSuccess'))
        router.push(result.session.mustChangePin ? '/mitra/ganti-pin' : '/mitra')
        router.refresh()
      } else {
        const message = serverErrorMessage(result.error, result.retryAfterSeconds, t)
        toast.error(message)
        setError('root', { type: 'server', message })
      }
    } catch {
      const message = t('errors.serviceUnavailable')
      toast.error(message)
      setError('root', { type: 'server', message })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <TextField control={control} name="accessCode" label={t('fields.accessCode')} placeholder={t('fields.accessCode_placeholder')} required />

      <FormFieldWrapper id="pin" label={t('fields.pin')} required error={errors.pin?.message}>
        <PasswordInput id="pin" placeholder={t('fields.pin_placeholder')} autoComplete="current-password" required {...register('pin')} />
      </FormFieldWrapper>

      <TurnstileField control={control} action="partner-login" />

      {errors.root && (
        <p className="text-destructive text-center text-xs font-medium" role="alert">
          {errors.root.message}
        </p>
      )}

      <LoadingButton type="submit" isLoading={isPending} loadingText={t('buttons.logging_in')} icon={LogIn} className="w-full font-bold">
        <span>{t('buttons.login')}</span>
      </LoadingButton>
    </form>
  )
}
