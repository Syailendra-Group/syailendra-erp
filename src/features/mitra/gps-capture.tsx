'use client'

import { useCallback, useState } from 'react'
import { Target } from 'lucide-react'
import { useTranslations } from 'next-intl'

export type GpsCoords = { latitude: number; longitude: number; accuracy: number }

interface GPSCaptureProps {
  onChange: (coords: GpsCoords | null) => void
  disabled?: boolean
  value?: GpsCoords | null
}

export function GPSCapture({ onChange, disabled = false, value = null }: GPSCaptureProps) {
  const t = useTranslations('mitra.shell')
  const [status, setStatus] = useState<'idle' | 'locating' | 'ok' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setError(t('errors.geolocationUnavailable'))
      setStatus('error')
      return
    }
    setStatus('locating')
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: GpsCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        setStatus('ok')
        onChange(coords)
      },
      (err) => {
        setStatus('error')
        // PositionError codes: 1 = permission denied, 2 = unavailable, 3 = timeout
        if (err.code === 1) {
          setError(t('errors.geolocationDenied'))
        } else if (err.code === 2) {
          setError(t('errors.geolocationUnavailable'))
        } else {
          setError(t('errors.geolocationFailed'))
        }
        onChange(null)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    )
  }, [onChange, t])

  const label = status === 'locating' ? t('map.locating') : status === 'ok' ? t('gps.fix') : t('gps.capture')

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={locate}
        disabled={disabled || status === 'locating'}
        className="border-input bg-background hover:bg-muted flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'locating' ? <Target className="size-3.5 shrink-0 animate-spin" /> : <Target className="size-3.5 shrink-0" />}
        {label}
      </button>
      {value && (
        <p className="text-muted-foreground text-[11px]">
          {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)} ({Math.round(value.accuracy)} m)
        </p>
      )}
      {error && <p className="text-destructive text-[11px] font-medium">{error}</p>}
    </div>
  )
}
