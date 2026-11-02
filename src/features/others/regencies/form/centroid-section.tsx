'use client'

import { MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { Input } from '@/components/ui/input'

import type { RegencyFormValues } from '@/schemas/others/regency-schema'
import type { ReactElement } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

export interface CentroidSectionProps {
  register: UseFormRegister<RegencyFormValues>
  errors: FieldErrors<RegencyFormValues>
  isPending: boolean
}

export function CentroidSection({ register, errors, isPending }: CentroidSectionProps): ReactElement {
  const tCommon = useTranslations('regional.common')

  return (
    <SectionCard
      title="Koordinat Geografis (Centroid)"
      description="Titik tengah wilayah untuk navigasi kamera peta otomatis"
      icon={MapPin}
      contentClassName="space-y-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormFieldWrapper id="latitude" label={tCommon('latitude')} error={errors.latitude?.message}>
          <Input
            id="latitude"
            type="number"
            step="0.0001"
            placeholder="-7.3167"
            disabled={isPending}
            {...register('latitude', { valueAsNumber: true })}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="longitude" label={tCommon('longitude')} error={errors.longitude?.message}>
          <Input
            id="longitude"
            type="number"
            step="0.0001"
            placeholder="110.1667"
            disabled={isPending}
            {...register('longitude', { valueAsNumber: true })}
          />
        </FormFieldWrapper>
      </div>

      <FormFieldWrapper id="description" label={tCommon('description')}>
        <Input
          id="description"
          placeholder="Sentra komoditas utama (e.g. Gaharu & Kopi Lereng Sumbing)"
          disabled={isPending}
          {...register('description')}
        />
      </FormFieldWrapper>
    </SectionCard>
  )
}
