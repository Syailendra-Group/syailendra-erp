'use client'

import { MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SectionCard } from '@/components/shared/section-card'
import { Input } from '@/components/ui/input'

import type { FarmerFormValues } from '@/schemas/farmer'
import type { ReactElement } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

export interface LocationSectionProps {
  register: UseFormRegister<FarmerFormValues>
  errors: FieldErrors<FarmerFormValues>
  isPending: boolean
}

export function LocationSection({ register, errors, isPending }: LocationSectionProps): ReactElement {
  const tTrace = useTranslations('traceability.farmers')

  return (
    <SectionCard
      title={tTrace('sections.location')}
      description={tTrace('sections.locationDesc')}
      icon={MapPin}
      contentClassName="grid grid-cols-1 gap-3.5 sm:grid-cols-2"
    >
      <FormFieldWrapper id="street" label={tTrace('fields.street')} required error={errors.street?.message}>
        <Input id="street" placeholder={tTrace('fields.streetPlaceholder')} disabled={isPending} {...register('street')} />
      </FormFieldWrapper>

      <FormFieldWrapper id="city" label={tTrace('fields.city')} required error={errors.city?.message}>
        <Input id="city" placeholder={tTrace('fields.cityPlaceholder')} disabled={isPending} {...register('city')} />
      </FormFieldWrapper>
    </SectionCard>
  )
}
