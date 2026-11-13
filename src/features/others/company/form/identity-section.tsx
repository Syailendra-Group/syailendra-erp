'use client'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import type { CompanyFormValues } from '@/schemas/others/company-schema'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

interface IdentitySectionProps {
  form: UseFormReturn<CompanyFormValues>
  t: (key: string) => string
}

export function IdentitySection({ form, t }: IdentitySectionProps): ReactElement {
  const {
    register,
    formState: { errors }
  } = form

  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-sm sm:text-base">{t('sections.identity.title')}</CardTitle>
        <CardDescription className="text-xs">{t('sections.identity.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormFieldWrapper id="short_name" label={t('fields.shortName')} required error={errors.short_name?.message} className="sm:col-span-1">
            <Input id="short_name" placeholder={t('fields.shortNamePlaceholder')} maxLength={30} {...register('short_name')} />
          </FormFieldWrapper>

          <FormFieldWrapper id="name" label={t('fields.name')} required error={errors.name?.message} className="sm:col-span-2">
            <Input id="name" placeholder={t('fields.namePlaceholder')} maxLength={120} {...register('name')} />
          </FormFieldWrapper>
        </div>

        <FormFieldWrapper id="tagline" label={t('fields.tagline')} error={errors.tagline?.message}>
          <Input id="tagline" placeholder={t('fields.taglinePlaceholder')} maxLength={200} {...register('tagline')} />
        </FormFieldWrapper>

        <FormFieldWrapper id="currency" label={t('fields.currency')}>
          <Input id="currency" value={t('fields.currencyValue')} disabled className="bg-muted text-muted-foreground font-mono text-xs" />
        </FormFieldWrapper>
      </CardContent>
    </Card>
  )
}
