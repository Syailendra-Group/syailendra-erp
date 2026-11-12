'use client'

import { type ReactElement } from 'react'
import { ExternalLink, MapPin } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface CoordsLinkProps {
  lat?: number | boolean | null
  lng?: number | boolean | null
  precision?: number
  className?: string
  fallback?: string
}

export function CoordsLink({ lat, lng, precision = 4, className, fallback = '-' }: CoordsLinkProps): ReactElement {
  const numLat = typeof lat === 'number' ? lat : null
  const numLng = typeof lng === 'number' ? lng : null

  const hasCoords = numLat !== null && numLng !== null && !isNaN(numLat) && !isNaN(numLng) && (numLat !== 0 || numLng !== 0)

  if (!hasCoords || numLat === null || numLng === null) {
    return <span className="text-muted-foreground font-mono text-xs">{fallback}</span>
  }

  const formattedLat = numLat.toFixed(precision)
  const formattedLng = numLng.toFixed(precision)
  const mapsUrl = `https://maps.google.com/?q=${numLat},${numLng}`

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('hover:text-primary text-muted-foreground inline-flex items-center gap-1 font-mono text-xs transition-colors', className)}
    >
      <MapPin className="text-primary size-3 shrink-0" />
      <span>
        {formattedLat}, {formattedLng}
      </span>
      <ExternalLink className="size-2.5 shrink-0 opacity-60" />
    </a>
  )
}
