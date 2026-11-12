'use client'

import { useMemo, useState } from 'react'
import { ExternalLink, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { MapPicker } from '@/components/map/map-picker'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCountriesQuery } from '@/hooks/sbi/others/use-countries'
import { useDistrictsQuery } from '@/hooks/sbi/others/use-districts'
import { useProvincesQuery } from '@/hooks/sbi/others/use-provinces'
import { useRegenciesQuery } from '@/hooks/sbi/others/use-regencies'
import { useVillagesQuery } from '@/hooks/sbi/others/use-villages'
import { extractCentroidCoordinates, getProvinceCentroid } from '@/utils/regional-helper'

import type { AddressSectionProps } from '@/types/components/address'
import type { MapCoordinates } from '@/types/components/map'
import type { ReactElement } from 'react'

const INDONESIA_CENTER: MapCoordinates = { latitude: -0.789275, longitude: 113.921327, zoom: 5 }

export function AddressSection({
  disabled = false,
  required = false,
  values,
  onChange,
  onCentroidPan,
  errors = {}
}: AddressSectionProps): ReactElement {
  const tTrace = useTranslations('scm.farmers')
  const tCommon = useTranslations('common')
  const [activeCentroid, setActiveCentroid] = useState<MapCoordinates | undefined>(undefined)

  const {
    country_id = 100,
    state_id,
    city_id,
    district_id,
    subdistrict_id,
    zip_code = '',
    street = '',
    address_detail = '',
    address_benchmark = '',
    latitude,
    longitude
  } = values

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

  const handleCountryChange = (val: string) => {
    const cId = Number(val)
    if (cId === 100) {
      triggerPan(INDONESIA_CENTER)
      onChange({ country_id: cId, state_id: undefined, city_id: undefined, district_id: undefined, subdistrict_id: undefined, ...INDONESIA_CENTER })
    } else {
      onChange({ country_id: cId, state_id: undefined, city_id: undefined, district_id: undefined, subdistrict_id: undefined })
    }
  }

  const handleProvinceChange = (val: string) => {
    const pId = Number(val)
    const selected = provinces.find((p) => p.id === pId)
    const centroid = getProvinceCentroid(selected?.name)
    const extra = { city_id: undefined, district_id: undefined, subdistrict_id: undefined }

    if (centroid) {
      const coords: MapCoordinates = { ...centroid, zoom: 8 }
      triggerPan(coords)
      onChange({ state_id: pId, ...extra, latitude: centroid.latitude, longitude: centroid.longitude })
    } else {
      onChange({ state_id: pId, ...extra })
    }
  }

  const handleRegencyChange = (val: string) => {
    const cId = Number(val)
    const selected = regencies.find((r) => r.id === cId)
    const centroid = extractCentroidCoordinates(selected)
    const extra = { district_id: undefined, subdistrict_id: undefined }

    if (centroid) {
      const coords: MapCoordinates = { ...centroid, zoom: 11 }
      triggerPan(coords)
      onChange({ city_id: cId, ...extra, latitude: centroid.latitude, longitude: centroid.longitude })
    } else {
      onChange({ city_id: cId, ...extra })
    }
  }

  const handleDistrictChange = (val: string) => {
    const dId = Number(val)
    const selected = districts.find((d) => d.id === dId)
    const centroid = extractCentroidCoordinates(selected)

    if (centroid) {
      const coords: MapCoordinates = { ...centroid, zoom: 13 }
      triggerPan(coords)
      onChange({ district_id: dId, subdistrict_id: undefined, latitude: centroid.latitude, longitude: centroid.longitude })
    } else {
      onChange({ district_id: dId, subdistrict_id: undefined })
    }
  }

  const handleVillageChange = (val: string) => {
    const sId = Number(val)
    const selected = villages.find((v) => v.id === sId)
    const centroid = extractCentroidCoordinates(selected)

    if (centroid) {
      const coords: MapCoordinates = { ...centroid, zoom: 15 }
      triggerPan(coords)
      onChange({ subdistrict_id: sId, street: selected?.name || street, latitude: centroid.latitude, longitude: centroid.longitude })
    } else {
      onChange({ subdistrict_id: sId, street: selected?.name || street })
    }
  }

  return (
    <SectionCard title={tTrace('sections.location')} description={tTrace('sections.locationDesc')} icon={MapPin} contentClassName="space-y-4">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {/* Left Column: Regional Inputs (Grid 2) & Detailed Addresses (Grid 1) */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <FormFieldWrapper id="country_id" label={tCommon('address.country')} required={required} error={errors.country_id?.message}>
              <SelectForm
                placeholder={tCommon('address.countryPlaceholder')}
                disabled={disabled}
                value={country_id ? String(country_id) : ''}
                onValueChange={handleCountryChange}
                items={countryOptions}
              />
            </FormFieldWrapper>

            <FormFieldWrapper id="state_id" label={tTrace('fields.province')} required={required} error={errors.state_id?.message}>
              <SelectForm
                placeholder={tTrace('fields.provincePlaceholder')}
                disabled={disabled || !country_id}
                value={state_id ? String(state_id) : ''}
                onValueChange={handleProvinceChange}
                items={provinceOptions}
              />
            </FormFieldWrapper>

            <FormFieldWrapper id="city_id" label={tTrace('fields.regency')} required={required} error={errors.city_id?.message}>
              <SelectForm
                placeholder={tTrace('fields.regencyPlaceholder')}
                disabled={disabled || !state_id}
                value={city_id ? String(city_id) : ''}
                onValueChange={handleRegencyChange}
                items={regencyOptions}
              />
            </FormFieldWrapper>

            <FormFieldWrapper id="district_id" label={tTrace('fields.district')} required={required} error={errors.district_id?.message}>
              <SelectForm
                placeholder={tTrace('fields.districtPlaceholder')}
                disabled={disabled || !city_id}
                value={district_id ? String(district_id) : ''}
                onValueChange={handleDistrictChange}
                items={districtOptions}
              />
            </FormFieldWrapper>

            <FormFieldWrapper id="subdistrict_id" label={tTrace('fields.village')} required={required} error={errors.subdistrict_id?.message}>
              <SelectForm
                placeholder={tTrace('fields.villagePlaceholder')}
                disabled={disabled || !district_id}
                value={subdistrict_id ? String(subdistrict_id) : ''}
                onValueChange={handleVillageChange}
                items={villageOptions}
              />
            </FormFieldWrapper>

            <FormFieldWrapper id="zip_code" label={tCommon('address.zipCode')} required={required} error={errors.zip_code?.message}>
              <Input
                id="zip_code"
                placeholder={tCommon('address.zipCodePlaceholder')}
                disabled={disabled}
                value={zip_code}
                onChange={(e) => onChange({ zip_code: e.target.value })}
              />
            </FormFieldWrapper>
          </div>

          <div className="flex flex-col gap-3.5">
            <FormFieldWrapper id="address_detail" label={tTrace('fields.addressDetail')} required={required} error={errors.address_detail?.message}>
              <Textarea
                id="address_detail"
                rows={3}
                placeholder={tTrace('fields.addressDetailPlaceholder')}
                disabled={disabled}
                value={address_detail}
                onChange={(e) => onChange({ address_detail: e.target.value })}
              />
            </FormFieldWrapper>

            <FormFieldWrapper id="address_benchmark" label={tCommon('address.benchmark')} required={false} error={errors.address_benchmark?.message}>
              <Textarea
                id="address_benchmark"
                rows={3}
                placeholder={tCommon('address.benchmarkPlaceholder')}
                disabled={disabled}
                value={address_benchmark}
                onChange={(e) => onChange({ address_benchmark: e.target.value })}
              />
            </FormFieldWrapper>
          </div>
        </div>

        {/* Right Column: Interactive Maps (Auto-pan) & Precise Lat/Lng (Grid 2) */}
        <div className="flex flex-col gap-3.5">
          <div className="space-y-1.5">
            <label className="text-foreground text-xs font-medium">
              {tTrace('map.title')} ({tTrace('map.subtitle')})
            </label>
            <MapPicker
              latitude={latitude}
              longitude={longitude}
              centroidPan={activeCentroid}
              onChange={({ latitude: lat, longitude: lng }) => onChange({ latitude: lat, longitude: lng })}
              disabled={disabled}
              className="h-100"
              locateMeLabel={tTrace('map.locateMe')}
              locatingLabel={tTrace('map.locating')}
              loadingLabel={tTrace('map.loading')}
            />
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <FormFieldWrapper id="partner_latitude" label={tTrace('fields.latitude')} required={required} error={errors.latitude?.message}>
              <Input
                id="partner_latitude"
                type="number"
                step="0.000001"
                placeholder={tTrace('fields.latitudePlaceholder')}
                disabled={disabled}
                value={typeof latitude === 'number' ? latitude : ''}
                onChange={(e) => onChange({ latitude: e.target.value ? Number(e.target.value) : undefined })}
              />
            </FormFieldWrapper>

            <FormFieldWrapper id="partner_longitude" label={tTrace('fields.longitude')} required={required} error={errors.longitude?.message}>
              <Input
                id="partner_longitude"
                type="number"
                step="0.000001"
                placeholder={tTrace('fields.longitudePlaceholder')}
                disabled={disabled}
                value={typeof longitude === 'number' ? longitude : ''}
                onChange={(e) => onChange({ longitude: e.target.value ? Number(e.target.value) : undefined })}
              />
            </FormFieldWrapper>
          </div>

          {latitude && longitude ? (
            <a
              href={`https://maps.google.com/?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
            >
              <ExternalLink className="size-3.5" />
              <span>{tTrace('map.openGmaps')}</span>
            </a>
          ) : null}
        </div>
      </div>
    </SectionCard>
  )
}
