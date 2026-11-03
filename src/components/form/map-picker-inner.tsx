'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Crosshair, Loader2 } from 'lucide-react'

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
  className,
  zoom = 13,
  centroidPan,
  locateMeLabel = 'Lokasi Saya',
  locatingLabel = 'Mencari GPS...'
}: MapPickerProps): ReactElement {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [isLocating, setIsLocating] = useState<boolean>(false)

  const activeLat = typeof latitude === 'number' && !isNaN(latitude) ? latitude : null
  const activeLng = typeof longitude === 'number' && !isNaN(longitude) ? longitude : null

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const initialCenter: [number, number] = activeLat !== null && activeLng !== null ? [activeLat, activeLng] : DEFAULT_CENTER

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom,
      zoomControl: true,
      scrollWheelZoom: true
    })

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    mapInstanceRef.current = map

    setTimeout(() => {
      map.invalidateSize()
    }, 200)

    return () => {
      map.off()
      map.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }
  }, [activeLat, activeLng, zoom])

  // 2. Handle Marker Creation / Movement
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (activeLat !== null && activeLng !== null) {
      const pos: L.LatLngExpression = [activeLat, activeLng]

      if (!markerRef.current) {
        const marker = L.marker(pos, {
          icon: createCustomMarkerIcon(),
          draggable: !disabled
        }).addTo(map)

        marker.on('dragend', () => {
          const newPos = marker.getLatLng()
          onChange({
            latitude: Number(newPos.lat.toFixed(6)),
            longitude: Number(newPos.lng.toFixed(6))
          })
        })

        markerRef.current = marker
      } else {
        markerRef.current.setLatLng(pos)
        if (disabled) {
          markerRef.current.dragging?.disable()
        } else {
          markerRef.current.dragging?.enable()
        }
      }
    } else if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }
  }, [activeLat, activeLng, disabled, onChange])

  // 3. Handle Map Click to Pin Location
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (disabled) return
      const { lat, lng } = e.latlng
      onChange({
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6))
      })
    }

    map.on('click', handleMapClick)

    return () => {
      map.off('click', handleMapClick)
    }
  }, [disabled, onChange])

  // 4. Handle Dynamic Centroid Pan (from province/regency change)
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

  // 5. GPS Current Geolocation
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
      <div ref={mapContainerRef} className="h-full min-h-[280px] w-full" />

      {/* Quick Locate Button Overlay */}
      <div className="absolute top-3 right-3 z-[1000]">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={handleLocateMe}
          disabled={disabled || isLocating}
          className="bg-background/90 hover:bg-background h-8 gap-1.5 px-2.5 text-xs font-medium shadow-md backdrop-blur-md"
        >
          {isLocating ? <Loader2 className="text-primary size-3.5 animate-spin" /> : <Crosshair className="text-primary size-3.5" />}
          <span>{isLocating ? locatingLabel : locateMeLabel}</span>
        </Button>
      </div>
    </div>
  )
}
