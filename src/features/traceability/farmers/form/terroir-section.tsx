'use client'

import { ExternalLink, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SectionCard } from '@/components/shared/section-card'
import { Input } from '@/components/ui/input'

import type { FarmerFormValues } from '@/schemas/farmer'
import type { ReactElement } from 'react'
import type { FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form'

export interface TerroirSectionProps {
  register: UseFormRegister<FarmerFormValues>
  errors: FieldErrors<FarmerFormValues>
  watch: UseFormWatch<FarmerFormValues>
  isPending: boolean
}

export function TerroirSection({ register, errors, watch, isPending }: TerroirSectionProps): ReactElement {
  const tTrace = useTranslations('traceability.farmers')
  const currentLat = watch('partner_latitude')
  const currentLng = watch('partner_longitude')

  return (
    <SectionCard title={tTrace('sections.terroir')} description={tTrace('sections.terroirDesc')} icon={ShieldCheck} contentClassName="space-y-3.5">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <FormFieldWrapper id="partner_latitude" label="Latitude (-7.xxxx)" required error={errors.partner_latitude?.message}>
          <Input
            id="partner_latitude"
            type="number"
            step="0.0001"
            placeholder="-7.2145"
            disabled={isPending}
            {...register('partner_latitude', { valueAsNumber: true })}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="partner_longitude" label="Longitude (109.xxxx)" required error={errors.partner_longitude?.message}>
          <Input
            id="partner_longitude"
            type="number"
            step="0.0001"
            placeholder="109.9124"
            disabled={isPending}
            {...register('partner_longitude', { valueAsNumber: true })}
          />
        </FormFieldWrapper>
      </div>

      {currentLat && currentLng ? (
        <a
          href={`https://maps.google.com/?q=${currentLat},${currentLng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
        >
          <ExternalLink className="size-3.5" />
          <span>{tTrace('detail.openGmaps')}</span>
        </a>
      ) : null}
    </SectionCard>
  )
}
