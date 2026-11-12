'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

import type { LocationMapInnerProps } from '@/types/components/map'
import type { ReactElement } from 'react'

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

export default function LocationMapCardInner({
  latitude,
  longitude,
  zoom = 14,
  markerLabel,
  markerPopup,
  height = 'h-64'
}: LocationMapInnerProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      dragging: true,
      touchZoom: true
    }).setView([latitude, longitude], zoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    const marker = L.marker([latitude, longitude], {
      icon: createCustomMarkerIcon()
    }).addTo(map)

    const popupContent = markerPopup || markerLabel
    if (popupContent) {
      marker.bindPopup(`<div style="font-family: inherit; font-size: 12px; font-weight: 500;">${popupContent}</div>`)
    }

    mapRef.current = map

    // Ensure proper sizing after render
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 200)

    return () => {
      clearTimeout(timer)
      map.remove()
      mapRef.current = null
    }
  }, [latitude, longitude, zoom, markerLabel, markerPopup])

  return <div ref={containerRef} className={`w-full ${height} z-0 overflow-hidden rounded-md`} />
}
