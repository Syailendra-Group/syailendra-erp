'use client'

import { MapPin } from 'lucide-react'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import type { CompanyFormValues } from '@/schemas/others/company-schema'
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
    <SectionCard title={t('sections.comms.title')} description={t('sections.comms.subtitle')} icon={MapPin} contentClassName="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormFieldWrapper id="email" label={t('fields.email')} error={errors.email?.message}>
          <Input id="email" type="email" placeholder={t('fields.emailPlaceholder')} {...register('email')} />
        </FormFieldWrapper>

        <FormFieldWrapper id="website" label={t('fields.website')} error={errors.website?.message}>
          <Input id="website" type="url" placeholder={t('fields.websitePlaceholder')} {...register('website')} />
        </FormFieldWrapper>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormFieldWrapper id="phone" label={t('fields.phone')} error={errors.phone?.message}>
          <Input id="phone" placeholder={t('fields.phonePlaceholder')} {...register('phone')} />
        </FormFieldWrapper>

        <FormFieldWrapper id="mobile" label={t('fields.mobile')} error={errors.mobile?.message}>
          <Input id="mobile" placeholder={t('fields.mobilePlaceholder')} {...register('mobile')} />
        </FormFieldWrapper>
      </div>

      <FormFieldWrapper id="vat" label={t('fields.vat')} error={errors.vat?.message}>
        <Input id="vat" placeholder={t('fields.vatPlaceholder')} {...register('vat')} />
      </FormFieldWrapper>

      <FormFieldWrapper id="street" label={t('fields.address')} error={errors.street?.message}>
        <Textarea id="street" placeholder={t('fields.addressPlaceholder')} rows={3} className="resize-none text-xs" {...register('street')} />
      </FormFieldWrapper>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormFieldWrapper id="city" label={t('fields.city')} error={errors.city?.message}>
          <Input id="city" placeholder={t('fields.cityPlaceholder')} {...register('city')} />
        </FormFieldWrapper>

        <FormFieldWrapper id="zip" label={t('fields.zip')} error={errors.zip?.message}>
          <Input id="zip" placeholder={t('fields.zipPlaceholder')} {...register('zip')} />
        </FormFieldWrapper>
      </div>
    </SectionCard>
  )
}
