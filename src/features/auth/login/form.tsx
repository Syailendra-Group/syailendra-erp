'use client'

import { type ReactElement } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, LogIn } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { PasswordInput } from '@/components/form/password-input'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useLoginMutation } from '@/hooks/auth/use-auth'
import { loginSchema } from '@/schemas/auth/auth-schema'

import type { LoginFormValues } from '@/schemas/auth/auth-schema'
import type { SubmitHandler } from 'react-hook-form'

export interface LoginFormProps {
  onSuccessRedirect?: string
}

export function LoginForm({ onSuccessRedirect = '/overview' }: LoginFormProps): ReactElement {
  const tAuth = useTranslations('auth')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { mutateAsync: login, isPending } = useLoginMutation()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  })

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    try {
      const result = await login(values)
      if (result.success) {
        toast.success(tAuth('messages.login_success'))
        router.push(onSuccessRedirect)
        router.refresh()
      } else {
        toast.error(result.error || tAuth('messages.login_failed'))
      }
    } catch {
      toast.error(tAuth('messages.login_failed'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        {/* Email Field with shadcn Field primitive */}
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email" className="text-xs font-semibold">
            {tAuth('fields.email')}
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder={tAuth('fields.email_placeholder')}
            autoComplete="email"
            disabled={isPending}
            {...register('email')}
          />
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </Field>

        {/* Password Field with shadcn Field primitive & reusable PasswordInput */}
        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password" className="text-xs font-semibold">
            {tAuth('fields.password')}
          </FieldLabel>
          <PasswordInput
            id="password"
            placeholder={tAuth('fields.password_placeholder')}
            autoComplete="current-password"
            disabled={isPending}
            {...register('password')}
          />
          {errors.password && <FieldError>{errors.password.message}</FieldError>}
        </Field>
      </FieldGroup>

      {/* Submit button */}
      <Button type="submit" className="w-full cursor-pointer gap-2 font-semibold" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {tAuth('buttons.logging_in')}
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            {tAuth('buttons.login')}
          </>
        )}
      </Button>

      {/* Status fallback indicator */}
      {isPending && <p className="text-muted-foreground animate-pulse text-center text-xs">{tCommon('status.loading')}</p>}
    </form>
  )
}
