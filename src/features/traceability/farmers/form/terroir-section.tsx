'use client'

import { useCallback } from 'react'
import { ExternalLink, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { MapPicker } from '@/components/form/map-picker'
import { Input } from '@/components/ui/input'

import type { FarmerFormValues } from '@/schemas/traceability/farmer-schema'
import type { MapCoordinates } from '@/types/components/map'
import type { ReactElement } from 'react'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'

export interface TerroirSectionProps {
  register: UseFormRegister<FarmerFormValues>
  errors: FieldErrors<FarmerFormValues>
  watch: UseFormWatch<FarmerFormValues>
  setValue: UseFormSetValue<FarmerFormValues>
  isPending: boolean
  centroidPan?: MapCoordinates | null
}

export function TerroirSection({ register, errors, watch, setValue, isPending, centroidPan }: TerroirSectionProps): ReactElement {
  const tTrace = useTranslations('traceability.farmers')
  const currentLat = watch('partner_latitude')
  const currentLng = watch('partner_longitude')

  const handleCoordinatesChange = useCallback(
    ({ latitude, longitude }: MapCoordinates) => {
      setValue('partner_latitude', latitude, { shouldValidate: true, shouldDirty: true })
      setValue('partner_longitude', longitude, { shouldValidate: true, shouldDirty: true })
    },
    [setValue]
  )

  return (
    <SectionCard title={tTrace('sections.terroir')} description={tTrace('sections.terroirDesc')} icon={ShieldCheck} contentClassName="space-y-4">
      {/* Interactive Leaflet Map Picker with Full Translations */}
      <div className="space-y-1.5">
        <label className="text-foreground text-xs font-medium">
          {tTrace('map.title')} ({tTrace('map.subtitle')})
        </label>
        <MapPicker
          latitude={currentLat}
          longitude={currentLng}
          onChange={handleCoordinatesChange}
          disabled={isPending}
          className="h-[280px]"
          centroidPan={centroidPan}
          locateMeLabel={tTrace('map.locateMe')}
          locatingLabel={tTrace('map.locating')}
          loadingLabel={tTrace('map.loading')}
        />
      </div>

      {/* Synchronized Numerical Inputs */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <FormFieldWrapper id="partner_latitude" label={tTrace('fields.latitude')} required error={errors.partner_latitude?.message}>
          <Input
            id="partner_latitude"
            type="number"
            step="0.000001"
            placeholder={tTrace('fields.latitudePlaceholder')}
            disabled={isPending}
            {...register('partner_latitude', { valueAsNumber: true })}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="partner_longitude" label={tTrace('fields.longitude')} required error={errors.partner_longitude?.message}>
          <Input
            id="partner_longitude"
            type="number"
            step="0.000001"
            placeholder={tTrace('fields.longitudePlaceholder')}
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
          <span>{tTrace('map.openGmaps')}</span>
        </a>
      ) : null}
    </SectionCard>
  )
}
