/**
 * map.ts — Centralized Types for Interactive Map Picker Component
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
