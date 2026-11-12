'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { CompanyFormValues } from '@/schemas/sbi/others/company-schema'
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
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="company-name" className="text-xs font-semibold">
            {t('fields.name')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="company-name"
            {...register('name')}
            placeholder={t('fields.namePlaceholder')}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company-tagline" className="text-xs font-semibold">
            {t('fields.tagline')}
          </Label>
          <Input id="company-tagline" {...register('tagline')} placeholder={t('fields.taglinePlaceholder')} />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="company-vat" className="text-xs font-semibold">
              {t('fields.vat')}
            </Label>
            <Input id="company-vat" {...register('vat')} placeholder={t('fields.vatPlaceholder')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company-currency" className="text-xs font-semibold">
              {t('fields.currency')}
            </Label>
            <Input id="company-currency" value="IDR (Rp) - Indonesian Rupiah" disabled className="bg-muted/50" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
