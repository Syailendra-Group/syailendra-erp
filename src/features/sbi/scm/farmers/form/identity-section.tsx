'use client'

import { Loader2, User } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { Input } from '@/components/ui/input'

import type { FarmerFormValues } from '@/schemas/sbi/scm/farmer-schema'
import type { ReactElement } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

export interface IdentitySectionProps {
  register: UseFormRegister<FarmerFormValues>
  errors: FieldErrors<FarmerFormValues>
  isPending: boolean
  isGeneratingRef?: boolean
}

export function IdentitySection({ register, errors, isPending, isGeneratingRef = false }: IdentitySectionProps): ReactElement {
  const tTrace = useTranslations('scm.farmers')

  return (
    <SectionCard
      title={tTrace('sections.identity')}
      description={tTrace('sections.identityDesc')}
      icon={User}
      contentClassName="grid grid-cols-1 gap-3.5 sm:grid-cols-2"
    >
      <FormFieldWrapper id="ref" label={tTrace('fields.ref')} error={errors.ref?.message}>
        <div className="relative">
          <Input
            id="ref"
            disabled={true}
            className="pr-8 font-mono text-xs"
            placeholder={isGeneratingRef ? tTrace('fields.refGenerating') : tTrace('fields.refPlaceholder')}
            {...register('ref')}
          />
          {isGeneratingRef && (
            <div className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center">
              <Loader2 className="text-primary size-3.5 animate-spin" />
            </div>
          )}
        </div>
      </FormFieldWrapper>

      <FormFieldWrapper id="legacy_code" label={tTrace('fields.legacyCode')} error={errors.legacy_code?.message}>
        <Input id="legacy_code" placeholder={tTrace('fields.legacyCodePlaceholder')} disabled={isPending} {...register('legacy_code')} />
      </FormFieldWrapper>

      <FormFieldWrapper id="name" label={tTrace('fields.name')} required error={errors.name?.message}>
        <Input id="name" placeholder={tTrace('fields.namePlaceholder')} disabled={isPending} {...register('name')} />
      </FormFieldWrapper>

      <FormFieldWrapper id="vat" label={tTrace('fields.vat')} error={errors.vat?.message}>
        <Input id="vat" maxLength={16} placeholder={tTrace('fields.vatPlaceholder')} disabled={isPending} {...register('vat')} />
      </FormFieldWrapper>

      <FormFieldWrapper id="phone" label={tTrace('fields.phone')} error={errors.phone?.message}>
        <Input id="phone" placeholder={tTrace('fields.phonePlaceholder')} disabled={isPending} {...register('phone')} />
      </FormFieldWrapper>

      <FormFieldWrapper id="email" label={tTrace('fields.email')} error={errors.email?.message}>
        <Input id="email" type="email" placeholder={tTrace('fields.emailPlaceholder')} disabled={isPending} {...register('email')} />
      </FormFieldWrapper>
    </SectionCard>
  )
}
