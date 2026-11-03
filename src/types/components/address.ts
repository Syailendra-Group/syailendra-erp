/**
 * address.ts — Centralized Types for Reusable Address Form Suite
 * Syailendra Group ERP
 */

import type { MapCoordinates } from './map'

export interface AddressFormState {
  country_id?: number
  state_id?: number
  city_id?: number
  district_id?: number
  subdistrict_id?: number
  zip_code?: string
  street?: string
  address_detail?: string
  address_benchmark?: string
  latitude?: number
  longitude?: number
}

export interface AddressSectionProps {
  disabled?: boolean
  className?: string
  values: AddressFormState
  onChange: (updates: Partial<AddressFormState>) => void
  onCentroidPan?: (coords: MapCoordinates) => void
  errors?: Record<string, { message?: string }>
}
