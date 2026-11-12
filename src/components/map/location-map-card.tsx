'use client'

import dynamic from 'next/dynamic'
import { ExternalLink, MapPin, MapPinOff } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { CopyableText } from '@/components/text'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import type { LocationMapCardProps, LocationMapInnerProps } from '@/types/components/map'
import type { ReactElement } from 'react'

const LocationMapCardInner = dynamic<LocationMapInnerProps>(() => import('./location-map-card-inner'), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full rounded-md" />
})

export function LocationMapCard({
  latitude,
  longitude,
  title,
  description,
  zoom = 14,
  markerLabel,
  markerPopup,
  className,
  height = 'h-64'
}: LocationMapCardProps): ReactElement {
  const tMap = useTranslations('common.map')

  const hasCoords =
    typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude) && (latitude !== 0 || longitude !== 0)

  const cardTitle = title || tMap('openGmaps')
  const cardDesc = description || tMap('subtitle')
  const formattedCoords = hasCoords ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : ''
  const gmapsUrl = hasCoords ? `https://www.google.com/maps?q=${latitude},${longitude}` : '#'

  return (
    <SectionCard
      title={cardTitle}
      description={cardDesc}
      icon={MapPin}
      className={className}
      contentClassName="space-y-3"
      headerActions={
        hasCoords ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <CopyableText
              text={`${latitude}, ${longitude}`}
              displayText={formattedCoords}
              variant="button"
              toastMessage={tMap('copied')}
              title={tMap('copyCoords')}
            />
            <Button variant="outline" size="sm" asChild className="h-7 gap-1 px-2 text-[11px]">
              <a href={gmapsUrl} target="_blank" rel="noopener noreferrer">
                <span>{tMap('openGmaps')}</span>
                <ExternalLink className="size-3" />
              </a>
            </Button>
          </div>
        ) : undefined
      }
    >
      {hasCoords ? (
        <div className="border-border/80 relative overflow-hidden rounded-md border">
          <LocationMapCardInner
            latitude={latitude}
            longitude={longitude}
            zoom={zoom}
            markerLabel={markerLabel}
            markerPopup={markerPopup}
            height={height}
          />
        </div>
      ) : (
        <div className="border-border/80 text-muted-foreground flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <MapPinOff className="mb-2 size-8 opacity-40" />
          <p className="text-foreground text-xs font-semibold">{tMap('noCoords')}</p>
          <p className="max-w-xs text-[11px] leading-relaxed">{tMap('noCoordsDesc')}</p>
        </div>
      )}
    </SectionCard>
  )
}
