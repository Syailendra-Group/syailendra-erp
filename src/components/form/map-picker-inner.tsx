'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Crosshair, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import 'leaflet/dist/leaflet.css'

import type { MapPickerProps } from '@/types/components/map'
import type { ReactElement } from 'react'

const DEFAULT_CENTER: [number, number] = [-7.2145, 109.9124] // Wonosobo / Dieng Plateau default

const createCustomMarkerIcon = () =>
  L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background-color: #059669;
        color: white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2);
        border: 2px solid white;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })

export default function MapPickerInner({
  latitude,
  longitude,
  onChange,
  disabled = false,
  locateMeLabel,
  locatingLabel,
  centroidPan,
  className
}: MapPickerProps): ReactElement {
  const tMap = useTranslations('common.map')
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  const activeLocateMeLabel = locateMeLabel || tMap('locateMe')
  const activeLocatingLabel = locatingLabel || tMap('locating')

  // Initialize Leaflet Map instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const initialLat = latitude ?? DEFAULT_CENTER[0]
    const initialLng = longitude ?? DEFAULT_CENTER[1]
    const initialZoom = latitude && longitude ? 14 : 9

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: !disabled,
      dragging: !disabled,
      touchZoom: !disabled
    }).setView([initialLat, initialLng], initialZoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    if (latitude && longitude) {
      const marker = L.marker([latitude, longitude], {
        icon: createCustomMarkerIcon(),
        draggable: !disabled
      }).addTo(map)

      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        onChange({
          latitude: Number(pos.lat.toFixed(6)),
          longitude: Number(pos.lng.toFixed(6))
        })
      })

      markerRef.current = marker
    }

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (disabled) return
      const { lat, lng } = e.latlng
      const newLat = Number(lat.toFixed(6))
      const newLng = Number(lng.toFixed(6))

      onChange({ latitude: newLat, longitude: newLng })

      if (markerRef.current) {
        markerRef.current.setLatLng([newLat, newLng])
      } else {
        const marker = L.marker([newLat, newLng], {
          icon: createCustomMarkerIcon(),
          draggable: true
        }).addTo(map)

        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          onChange({
            latitude: Number(pos.lat.toFixed(6)),
            longitude: Number(pos.lng.toFixed(6))
          })
        })

        markerRef.current = marker
      }
    })

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Synchronize marker position with coordinate state
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (latitude && longitude) {
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude])
      } else {
        const marker = L.marker([latitude, longitude], {
          icon: createCustomMarkerIcon(),
          draggable: !disabled
        }).addTo(map)

        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          onChange({
            latitude: Number(pos.lat.toFixed(6)),
            longitude: Number(pos.lng.toFixed(6))
          })
        })

        markerRef.current = marker
      }
    } else if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }
  }, [latitude, longitude, disabled, onChange])

  // Pan map centroid to selected regional coordinates
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !centroidPan) return

    const { latitude: cLat, longitude: cLng } = centroidPan
    if (typeof cLat === 'number' && typeof cLng === 'number' && !isNaN(cLat) && !isNaN(cLng)) {
      map.flyTo([cLat, cLng], Math.max(map.getZoom(), 13), {
        duration: 1.2
      })
    }
  }, [centroidPan])

  // Geolocation GPS positioning
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation || disabled) return
    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false)
        const lat = Number(position.coords.latitude.toFixed(6))
        const lng = Number(position.coords.longitude.toFixed(6))

        onChange({ latitude: lat, longitude: lng })

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.5 })
        }
      },
      (error) => {
        setIsLocating(false)
        console.warn('Geolocation position lookup failed:', error.message)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [disabled, onChange])

  return (
    <div className={cn('border-border/80 relative overflow-hidden rounded-lg border', className)}>
      <div ref={mapContainerRef} className="h-full min-h-70 w-full" />

      {/* Quick Locate Button Overlay */}
      <div className="absolute top-3 right-3 z-1000">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={handleLocateMe}
          disabled={disabled || isLocating}
          className="bg-background/90 hover:bg-background h-8 gap-1.5 px-2.5 text-xs font-medium shadow-md backdrop-blur-md"
        >
          {isLocating ? <Loader2 className="text-primary size-3.5 animate-spin" /> : <Crosshair className="text-primary size-3.5" />}
          <span>{isLocating ? activeLocatingLabel : activeLocateMeLabel}</span>
        </Button>
      </div>
    </div>
  )
}
