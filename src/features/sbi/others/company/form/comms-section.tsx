'use client'

import { Globe, Mail, MapPin, Phone } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import type { CompanyFormValues } from '@/schemas/sbi/others/company-schema'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

interface CommsSectionProps {
  form: UseFormReturn<CompanyFormValues>
  t: (key: string) => string
}

export function CommsSection({ form, t }: CommsSectionProps): ReactElement {
  const {
    register,
    formState: { errors }
  } = form

  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-sm sm:text-base">{t('sections.comms.title')}</CardTitle>
        <CardDescription className="text-xs">{t('sections.comms.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="company-email" className="flex items-center gap-1.5 text-xs font-semibold">
              <Mail className="text-primary size-3.5" />
              <span>{t('fields.email')}</span>
            </Label>
            <Input
              id="company-email"
              type="email"
              {...register('email')}
              placeholder={t('fields.emailPlaceholder')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company-phone" className="flex items-center gap-1.5 text-xs font-semibold">
              <Phone className="text-primary size-3.5" />
              <span>{t('fields.phone')}</span>
            </Label>
            <Input id="company-phone" {...register('phone')} placeholder={t('fields.phonePlaceholder')} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company-website" className="flex items-center gap-1.5 text-xs font-semibold">
            <Globe className="text-primary size-3.5" />
            <span>{t('fields.website')}</span>
          </Label>
          <Input id="company-website" {...register('website')} placeholder={t('fields.websitePlaceholder')} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company-street" className="flex items-center gap-1.5 text-xs font-semibold">
            <MapPin className="text-primary size-3.5" />
            <span>{t('fields.address')}</span>
          </Label>
          <Textarea id="company-street" rows={3} {...register('street')} placeholder={t('fields.addressPlaceholder')} />
        </div>
      </CardContent>
    </Card>
  )
}
