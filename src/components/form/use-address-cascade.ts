'use client'

import { useMemo, useState } from 'react'

import { useCountriesQuery } from '@/hooks/others/use-countries'
import { useDistrictsQuery } from '@/hooks/others/use-districts'
import { useProvincesQuery } from '@/hooks/others/use-provinces'
import { useRegenciesQuery } from '@/hooks/others/use-regencies'
import { useVillagesQuery } from '@/hooks/others/use-villages'
import { extractCentroidCoordinates, getProvinceCentroid } from '@/utils/regional-helper'

import type { AddressFormState } from '@/types/components/address'
import type { MapCoordinates } from '@/types/components/map'

const INDONESIA_CENTER: MapCoordinates = { latitude: -0.789275, longitude: 113.921327, zoom: 5 }

export interface AddressCascadeHandlers {
  onCountryChange: (val: string) => void
  onProvinceChange: (val: string) => void
  onRegencyChange: (val: string) => void
  onDistrictChange: (val: string) => void
  onVillageChange: (val: string) => void
}

export interface AddressCascadeResult extends AddressCascadeHandlers {
  activeCentroid?: MapCoordinates
  countryOptions: { label: string; value: string }[]
  provinceOptions: { label: string; value: string }[]
  regencyOptions: { label: string; value: string }[]
  districtOptions: { label: string; value: string }[]
  villageOptions: { label: string; value: string }[]
}

/**
 * Shared cascading regional state for the reusable address suite: five-level
 * selector options, descendant clearing, centroid auto-pan, and lat/lng sync.
 */
export function useAddressCascade(
  values: AddressFormState,
  onChange: (updates: Partial<AddressFormState>) => void,
  onCentroidPan?: (coords: MapCoordinates) => void,
  showStreetInput = false
): AddressCascadeResult {
  const [activeCentroid, setActiveCentroid] = useState<MapCoordinates | undefined>(undefined)

  const { country_id = showStreetInput ? undefined : 100, state_id, city_id, district_id } = values

  const { data: countries = [] } = useCountriesQuery()
  const { data: provinces = [] } = useProvincesQuery(country_id)
  const { data: regencies = [] } = useRegenciesQuery(state_id)
  const { data: districts = [] } = useDistrictsQuery(city_id)
  const { data: villages = [] } = useVillagesQuery(district_id)

  const countryOptions = useMemo(() => countries.map((c) => ({ label: c.name, value: String(c.id) })), [countries])
  const provinceOptions = useMemo(() => provinces.map((p) => ({ label: p.name, value: String(p.id) })), [provinces])
  const regencyOptions = useMemo(() => regencies.map((r) => ({ label: r.name, value: String(r.id) })), [regencies])
  const districtOptions = useMemo(() => districts.map((d) => ({ label: d.name, value: String(d.id) })), [districts])
  const villageOptions = useMemo(() => villages.map((v) => ({ label: v.name, value: String(v.id) })), [villages])

  const triggerPan = (coords: MapCoordinates) => {
    setActiveCentroid(coords)
    onCentroidPan?.(coords)
  }

  const onCountryChange = (val: string) => {
    const cId = Number(val)
    if (cId === 100) {
      triggerPan(INDONESIA_CENTER)
      onChange({
        country_id: cId,
        state_id: undefined,
        city_id: undefined,
        district_id: undefined,
        subdistrict_id: undefined,
        ...(showStreetInput ? {} : INDONESIA_CENTER)
      })
    } else {
      onChange({ country_id: cId, state_id: undefined, city_id: undefined, district_id: undefined, subdistrict_id: undefined })
    }
  }

  const onProvinceChange = (val: string) => {
    const pId = Number(val)
    const selected = provinces.find((p) => p.id === pId)
    const centroid = getProvinceCentroid(selected?.name)
    const extra = { city_id: undefined, district_id: undefined, subdistrict_id: undefined }

    if (centroid) {
      const coords: MapCoordinates = { ...centroid, zoom: 8 }
      triggerPan(coords)
      onChange({ state_id: pId, ...extra, ...(showStreetInput ? {} : { latitude: centroid.latitude, longitude: centroid.longitude }) })
    } else {
      onChange({ state_id: pId, ...extra })
    }
  }

  const onRegencyChange = (val: string) => {
    const cId = Number(val)
    const selected = regencies.find((r) => r.id === cId)
    const centroid = extractCentroidCoordinates(selected)
    const extra = { district_id: undefined, subdistrict_id: undefined }

    if (centroid) {
      const coords: MapCoordinates = { ...centroid, zoom: 11 }
      triggerPan(coords)
      onChange({ city_id: cId, ...extra, ...(showStreetInput ? {} : { latitude: centroid.latitude, longitude: centroid.longitude }) })
    } else {
      onChange({ city_id: cId, ...extra })
    }
  }

  const onDistrictChange = (val: string) => {
    const dId = Number(val)
    const selected = districts.find((d) => d.id === dId)
    const centroid = extractCentroidCoordinates(selected)

    if (centroid) {
      const coords: MapCoordinates = { ...centroid, zoom: 13 }
      triggerPan(coords)
      onChange({
        district_id: dId,
        subdistrict_id: undefined,
        ...(showStreetInput ? {} : { latitude: centroid.latitude, longitude: centroid.longitude })
      })
    } else {
      onChange({ district_id: dId, subdistrict_id: undefined })
    }
  }

  const onVillageChange = (val: string) => {
    const sId = Number(val)
    const selected = villages.find((v) => v.id === sId)
    const centroid = extractCentroidCoordinates(selected)

    if (centroid) {
      const coords: MapCoordinates = { ...centroid, zoom: 15 }
      triggerPan(coords)
      onChange({
        subdistrict_id: sId,
        street: showStreetInput ? values.street : selected?.name || values.street,
        ...(showStreetInput ? {} : { latitude: centroid.latitude, longitude: centroid.longitude })
      })
    } else {
      onChange({ subdistrict_id: sId, street: showStreetInput ? values.street : selected?.name || values.street })
    }
  }

  return {
    activeCentroid,
    countryOptions,
    provinceOptions,
    regencyOptions,
    districtOptions,
    villageOptions,
    onCountryChange,
    onProvinceChange,
    onRegencyChange,
    onDistrictChange,
    onVillageChange
  }
}
