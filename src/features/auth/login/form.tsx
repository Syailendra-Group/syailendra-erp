'use client'

import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, LogIn } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { PasswordInput } from '@/components/form/password-input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useLoginMutation } from '@/hooks/auth/use-auth'
import { getLoginSchema } from '@/schemas/auth/auth-schema'

import type { LoginFormValues } from '@/schemas/auth/auth-schema'
import type { ReactElement } from 'react'
import type { SubmitHandler } from 'react-hook-form'

export interface LoginFormProps {
  onSuccessRedirect?: string
}

export function LoginForm({ onSuccessRedirect = '/overview' }: LoginFormProps): ReactElement {
  const tAuth = useTranslations('auth')
  const router = useRouter()
  const { mutateAsync: login, isPending } = useLoginMutation()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(getLoginSchema(tAuth)),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  })

  const rememberMe = watch('rememberMe')

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
      {/* Email input field using standardized FormFieldWrapper */}
      <FormFieldWrapper id="email" label={tAuth('fields.email')} required error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          placeholder={tAuth('fields.email_placeholder')}
          autoComplete="email"
          disabled={isPending}
          {...register('email')}
        />
      </FormFieldWrapper>

      {/* Password input field using standardized FormFieldWrapper and PasswordInput */}
      <FormFieldWrapper id="password" label={tAuth('fields.password')} required error={errors.password?.message}>
        <PasswordInput
          id="password"
          placeholder={tAuth('fields.password_placeholder')}
          autoComplete="current-password"
          disabled={isPending}
          {...register('password')}
        />
      </FormFieldWrapper>

      {/* Remember me checkbox control */}
      <div className="flex items-center space-x-2 pt-0.5">
        <Checkbox
          id="rememberMe"
          checked={rememberMe}
          onCheckedChange={(checked) => setValue('rememberMe', Boolean(checked))}
          disabled={isPending}
        />
        <label
          htmlFor="rememberMe"
          className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-medium select-none"
        >
          {tAuth('fields.remember')}
        </label>
      </div>

      {/* Submit action button */}
      <Button type="submit" className="w-full cursor-pointer gap-2 font-semibold" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{tAuth('buttons.logging_in')}</span>
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            <span>{tAuth('buttons.login')}</span>
          </>
        )}
      </Button>
    </form>
  )
}
