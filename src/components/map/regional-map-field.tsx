'use client'

import { ExternalLink, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { MapPicker } from './map-picker'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import type { RegionalMapFieldProps } from '@/types/components/map'
import type { ReactElement } from 'react'

export function RegionalMapField({
  latitude,
  longitude,
  centroidPan,
  onLocationChange,
  disabled = false,
  className
}: RegionalMapFieldProps): ReactElement {
  const tMap = useTranslations('common.map')
  const tReg = useTranslations('regional.common')

  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude)

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const num = val === '' || isNaN(Number(val)) ? undefined : Number(val)
    onLocationChange({ latitude: num, longitude })
  }

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const num = val === '' || isNaN(Number(val)) ? undefined : Number(val)
    onLocationChange({ latitude, longitude: num })
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
          <MapPin className="text-primary size-3.5" />
          <span>{tReg('coordinates')}</span>
        </label>
        {hasCoords && (
          <a
            href={`https://www.google.com/maps?q=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-[11px] font-medium transition-colors"
          >
            <span>{tMap('openGmaps')}</span>
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>

      <MapPicker
        latitude={latitude}
        longitude={longitude}
        centroidPan={centroidPan}
        onChange={({ latitude: lat, longitude: lng }) => onLocationChange({ latitude: lat, longitude: lng })}
        disabled={disabled}
        className="h-60"
        locateMeLabel={tMap('locateMe')}
        locatingLabel={tMap('locating')}
      />

      <div className="grid grid-cols-2 gap-2.5">
        <FormFieldWrapper id="reg-lat" label={tReg('latitude')}>
          <Input
            id="reg-lat"
            type="number"
            step="any"
            value={typeof latitude === 'number' && !isNaN(latitude) ? latitude : ''}
            onChange={handleLatChange}
            placeholder="-7.123456"
            disabled={disabled}
            className="h-8 font-mono text-xs"
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="reg-lng" label={tReg('longitude')}>
          <Input
            id="reg-lng"
            type="number"
            step="any"
            value={typeof longitude === 'number' && !isNaN(longitude) ? longitude : ''}
            onChange={handleLngChange}
            placeholder="110.123456"
            disabled={disabled}
            className="h-8 font-mono text-xs"
          />
        </FormFieldWrapper>
      </div>
    </div>
  )
}
