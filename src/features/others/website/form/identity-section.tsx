'use client'

import { Globe } from 'lucide-react'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import type { SiteConfigFormValues } from '@/schemas/others/website-schema'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

interface IdentitySectionProps {
  form: UseFormReturn<SiteConfigFormValues>
  t: (key: string) => string
}

export function IdentitySection({ form, t }: IdentitySectionProps): ReactElement {
  const {
    register,
    formState: { errors }
  } = form

  return (
    <SectionCard title={t('sections.identity.title')} description={t('sections.identity.subtitle')} icon={Globe} contentClassName="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormFieldWrapper id="site_name" label={t('fields.siteName')} required error={errors.site_name?.message}>
          <Input id="site_name" placeholder="SYAILENDRA ERP" maxLength={60} {...register('site_name')} />
        </FormFieldWrapper>

        <FormFieldWrapper id="company_name" label={t('fields.companyName')} required error={errors.company_name?.message}>
          <Input id="company_name" placeholder="Syailendra Group" maxLength={120} {...register('company_name')} />
        </FormFieldWrapper>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormFieldWrapper id="site_descriptor" label={t('fields.siteDescriptor')} error={errors.site_descriptor?.message}>
          <Input id="site_descriptor" placeholder="INTEGRATED BUSINESS MANAGEMENT PLATFORM" maxLength={120} {...register('site_descriptor')} />
        </FormFieldWrapper>

        <FormFieldWrapper id="login_tagline" label={t('fields.loginTagline')} error={errors.login_tagline?.message}>
          <Input id="login_tagline" placeholder="Smarter Systems, Stronger Businesses." maxLength={200} {...register('login_tagline')} />
        </FormFieldWrapper>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormFieldWrapper id="login_card_title" label={t('fields.loginCardTitle')} error={errors.login_card_title?.message}>
          <Input id="login_card_title" placeholder="Masuk ke Sistem" maxLength={100} {...register('login_card_title')} />
        </FormFieldWrapper>

        <FormFieldWrapper id="footer_backbone" label={t('fields.footerBackbone')} error={errors.footer_backbone?.message}>
          <Input id="footer_backbone" placeholder="A DIGITAL BACKBONE..." maxLength={200} {...register('footer_backbone')} />
        </FormFieldWrapper>
      </div>

      <FormFieldWrapper id="login_card_description" label={t('fields.loginCardDesc')} error={errors.login_card_description?.message}>
        <Textarea
          id="login_card_description"
          placeholder="Masukkan email dan kata sandi..."
          rows={3}
          className="resize-none text-xs"
          {...register('login_card_description')}
        />
      </FormFieldWrapper>
    </SectionCard>
  )
}
