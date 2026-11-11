/**
 * map.ts — Centralized Types for Geospatial & Map UI Components
 * Syailendra Group ERP
 */

export interface MapCoordinates {
  latitude: number
  longitude: number
  zoom?: number
}

export interface MapPickerProps {
  latitude?: number | null
  longitude?: number | null
  onChange: (coords: MapCoordinates) => void
  disabled?: boolean
  className?: string
  zoom?: number
  centroidPan?: MapCoordinates | null
  locateMeLabel?: string
  locatingLabel?: string
  loadingLabel?: string
}

export interface RegionalMapFieldProps {
  latitude?: number
  longitude?: number
  centroidPan?: MapCoordinates | null
  onLocationChange: (coords: { latitude?: number; longitude?: number }) => void
  disabled?: boolean
  className?: string
}

export interface LocationMapInnerProps {
  latitude: number
  longitude: number
  zoom?: number
  markerLabel?: string
  markerPopup?: string
  height?: string
}

export interface LocationMapCardProps {
  latitude?: number | false | null
  longitude?: number | false | null
  title?: string
  description?: string
  zoom?: number
  markerLabel?: string
  markerPopup?: string
  className?: string
  height?: string
}
