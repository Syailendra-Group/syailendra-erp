'use client'

import { User } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { Input } from '@/components/ui/input'

import type { FarmerFormValues } from '@/schemas/scm/farmer-schema'
import type { ReactElement } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

export interface IdentitySectionProps {
  register: UseFormRegister<FarmerFormValues>
  errors: FieldErrors<FarmerFormValues>
  isPending: boolean
}

export function IdentitySection({ register, errors, isPending }: IdentitySectionProps): ReactElement {
  const tTrace = useTranslations('scm.farmers')

  return (
    <SectionCard
      title={tTrace('sections.identity')}
      description={tTrace('sections.identityDesc')}
      icon={User}
      contentClassName="grid grid-cols-1 gap-3.5 sm:grid-cols-2"
    >
      <FormFieldWrapper id="ref" label={tTrace('fields.ref')}>
        <Input id="ref" disabled={true} {...register('ref')} />
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
    </SectionCard>
  )
}
