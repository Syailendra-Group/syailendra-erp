'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { partnerChangePinAction } from '@/actions/auth/partner/auth.action'
import { LoadingButton } from '@/components/button/loading-button'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { PasswordInput } from '@/components/form/password-input'
import { useRouter } from '@/i18n/navigation'
import { getPartnerChangePinSchema } from '@/schemas/mitra/auth-schema'

import type { PartnerChangePinFormValues } from '@/schemas/mitra/auth-schema'
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
    case 'weak_pin':
      return t('errors.weakPin')
    case 'service_unavailable':
      return t('errors.serviceUnavailable')
    default:
      return t('errors.invalidInput')
  }
}

export function PartnerChangePinForm(): ReactElement {
  const t = useTranslations('mitra.pin')
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<PartnerChangePinFormValues>({
    resolver: zodResolver(getPartnerChangePinSchema(t)),
    defaultValues: { oldPin: '', newPin: '', confirmPin: '' }
  })

  const onSubmit: SubmitHandler<PartnerChangePinFormValues> = async (values) => {
    setIsPending(true)
    try {
      const result = await partnerChangePinAction({ oldPin: values.oldPin, newPin: values.newPin })
      if (result.ok) {
        toast.success(t('messages.pinChanged'))
        router.push('/mitra')
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
      <FormFieldWrapper id="oldPin" label={t('fields.oldPin')} required error={errors.oldPin?.message}>
        <PasswordInput id="oldPin" placeholder={t('fields.oldPin_placeholder')} autoComplete="current-password" required {...register('oldPin')} />
      </FormFieldWrapper>

      <FormFieldWrapper id="newPin" label={t('fields.newPin')} required error={errors.newPin?.message}>
        <PasswordInput id="newPin" placeholder={t('fields.newPin_placeholder')} autoComplete="new-password" required {...register('newPin')} />
      </FormFieldWrapper>

      <FormFieldWrapper id="confirmPin" label={t('fields.confirmPin')} required error={errors.confirmPin?.message}>
        <PasswordInput
          id="confirmPin"
          placeholder={t('fields.confirmPin_placeholder')}
          autoComplete="new-password"
          required
          {...register('confirmPin')}
        />
      </FormFieldWrapper>

      {errors.root && (
        <p className="text-destructive text-center text-xs font-medium" role="alert">
          {errors.root.message}
        </p>
      )}

      <LoadingButton type="submit" isLoading={isPending} loadingText={t('buttons.changing')} className="w-full font-bold">
        <span>{t('buttons.changePin')}</span>
      </LoadingButton>
    </form>
  )
}
