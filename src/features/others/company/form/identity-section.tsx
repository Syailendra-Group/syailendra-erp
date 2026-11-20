'use client'

import { Building } from 'lucide-react'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { ImageDropzone } from '@/components/image/image-dropzone'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

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
    watch,
    setValue,
    formState: { errors }
  } = form

  const logoBase64 = watch('logo_web')

  return (
    <SectionCard title={t('sections.identity.title')} description={t('sections.identity.subtitle')} icon={Building} contentClassName="space-y-4">
      {/* Integrated Corporate Logo with Ergonomic Dropzone */}
      <div className="space-y-2">
        <div className="space-y-0.5">
          <span className="text-xs font-semibold">{t('sections.logo.title')}</span>
          <p className="text-muted-foreground text-[11px] leading-relaxed">{t('fields.dragDrop')}</p>
        </div>

        <div className="flex justify-start">
          <ImageDropzone
            value={logoBase64}
            onChange={(b64) => setValue('logo_web', (b64 as string) || null, { shouldDirty: true })}
            valueMode="base64"
            aspectRatio={1}
          />
        </div>
      </div>

      <Separator />

      {/* Core Corporate Identity Fields */}
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
    </SectionCard>
  )
}
