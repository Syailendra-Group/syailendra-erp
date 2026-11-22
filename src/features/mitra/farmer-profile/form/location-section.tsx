'use client'

import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { MitraNumberInput } from '@/components/form/mitra-fields'
import { GPSCapture } from '@/features/mitra/gps-capture'

type FarmerLocationSectionProps = {
  gpsLat?: number
  gpsLon?: number
  onGpsChange: (coords: { latitude: number; longitude: number } | null) => void
  disabled?: boolean
}

/**
 * FarmerLocationSection — GPS capture plus manual coordinate fields.
 * The numeric inputs rely on the surrounding react-hook-form context.
 */
export function FarmerLocationSection({ gpsLat, gpsLon, onGpsChange, disabled = false }: FarmerLocationSectionProps) {
  const t = useTranslations('mitra.farmer')

  return (
    <SectionCard>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">{t('gps.capture')}</h3>
        <GPSCapture onChange={onGpsChange} disabled={disabled} />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <MitraNumberInput name="farm_latitude" label={t('farmerProfile.labelLatitude')} placeholder={t('farmerProfile.placeholderLatitude')} />
          <MitraNumberInput name="farm_longitude" label={t('farmerProfile.labelLongitude')} placeholder={t('farmerProfile.placeholderLongitude')} />
        </div>
        {gpsLat != null && gpsLon != null ? (
          <p className="text-muted-foreground text-[11px]">
            {gpsLat.toFixed(5)}, {gpsLon.toFixed(5)}
          </p>
        ) : null}
      </div>
    </SectionCard>
  )
}
