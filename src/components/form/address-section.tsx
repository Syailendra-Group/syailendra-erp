'use client'

import { ExternalLink, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { AddressTextFields } from '@/components/form/address-text-fields'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { useAddressCascade } from '@/components/form/use-address-cascade'
import { MapPicker } from '@/components/map/map-picker'
import { Input } from '@/components/ui/input'

import type { AddressSectionProps } from '@/types/components/address'
import type { ReactElement } from 'react'

export function AddressSection({
  disabled = false,
  required = false,
  values,
  onChange,
  onCentroidPan,
  errors = {},
  showStreetInput = false
}: AddressSectionProps): ReactElement {
  const tAddress = useTranslations('common.address')
  const tMap = useTranslations('common.map')

  const {
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
  } = useAddressCascade(values, onChange, onCentroidPan, showStreetInput)

  const {
    country_id = showStreetInput ? undefined : 100,
    state_id,
    city_id,
    district_id,
    subdistrict_id,
    zip_code = '',
    latitude,
    longitude
  } = values

  return (
    <SectionCard title={tAddress('sections.location')} description={tAddress('sections.locationDesc')} icon={MapPin} contentClassName="space-y-4">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {/* Left Column: Regional Inputs (Grid 2) & Detailed Addresses (Grid 1) */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <FormFieldWrapper id="country_id" label={tAddress('country')} required={required} error={errors.country_id?.message}>
              <SelectForm
                id="country_id"
                aria-invalid={Boolean(errors.country_id)}
                aria-describedby={errors.country_id ? 'country_id-error' : undefined}
                placeholder={tAddress('countryPlaceholder')}
                disabled={disabled}
                value={country_id ? String(country_id) : ''}
                onValueChange={onCountryChange}
                items={countryOptions}
              />
            </FormFieldWrapper>

            <FormFieldWrapper id="state_id" label={tAddress('fields.province')} required={required} error={errors.state_id?.message}>
              <SelectForm
                id="state_id"
                aria-invalid={Boolean(errors.state_id)}
                aria-describedby={errors.state_id ? 'state_id-error' : undefined}
                placeholder={tAddress('fields.provincePlaceholder')}
                disabled={disabled || !country_id}
                value={state_id ? String(state_id) : ''}
                onValueChange={onProvinceChange}
                items={provinceOptions}
              />
            </FormFieldWrapper>

            <FormFieldWrapper id="city_id" label={tAddress('fields.regency')} required={required} error={errors.city_id?.message}>
              <SelectForm
                id="city_id"
                aria-invalid={Boolean(errors.city_id)}
                aria-describedby={errors.city_id ? 'city_id-error' : undefined}
                placeholder={tAddress('fields.regencyPlaceholder')}
                disabled={disabled || !state_id}
                value={city_id ? String(city_id) : ''}
                onValueChange={onRegencyChange}
                items={regencyOptions}
              />
            </FormFieldWrapper>

            <FormFieldWrapper id="district_id" label={tAddress('fields.district')} required={required} error={errors.district_id?.message}>
              <SelectForm
                id="district_id"
                aria-invalid={Boolean(errors.district_id)}
                aria-describedby={errors.district_id ? 'district_id-error' : undefined}
                placeholder={tAddress('fields.districtPlaceholder')}
                disabled={disabled || !city_id}
                value={district_id ? String(district_id) : ''}
                onValueChange={onDistrictChange}
                items={districtOptions}
              />
            </FormFieldWrapper>

            <FormFieldWrapper id="subdistrict_id" label={tAddress('fields.village')} required={required} error={errors.subdistrict_id?.message}>
              <SelectForm
                id="subdistrict_id"
                aria-invalid={Boolean(errors.subdistrict_id)}
                aria-describedby={errors.subdistrict_id ? 'subdistrict_id-error' : undefined}
                placeholder={tAddress('fields.villagePlaceholder')}
                disabled={disabled || !district_id}
                value={subdistrict_id ? String(subdistrict_id) : ''}
                onValueChange={onVillageChange}
                items={villageOptions}
              />
            </FormFieldWrapper>

            <FormFieldWrapper id="zip_code" label={tAddress('zipCode')} required={required} error={errors.zip_code?.message}>
              <Input
                id="zip_code"
                placeholder={tAddress('zipCodePlaceholder')}
                disabled={disabled}
                value={zip_code}
                onChange={(e) => onChange({ zip_code: e.target.value })}
              />
            </FormFieldWrapper>
          </div>

          <AddressTextFields
            values={values}
            onChange={onChange}
            disabled={disabled}
            required={required}
            errors={errors}
            showStreetInput={showStreetInput}
          />
        </div>

        {/* Right Column: Interactive Maps (Auto-pan) & Precise Lat/Lng (Grid 2) */}
        <div className="flex flex-col gap-3.5">
          <div className="space-y-1.5">
            <label className="text-foreground text-xs font-medium">
              {tMap('title')} ({tMap('subtitle')})
            </label>
            <MapPicker
              latitude={latitude}
              longitude={longitude}
              centroidPan={activeCentroid}
              onChange={({ latitude: lat, longitude: lng }) => onChange({ latitude: lat, longitude: lng })}
              disabled={disabled}
              className="h-100"
              locateMeLabel={tMap('locateMe')}
              locatingLabel={tMap('locating')}
              loadingLabel={tMap('loading')}
            />
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <FormFieldWrapper id="partner_latitude" label={tAddress('fields.latitude')} required={required} error={errors.latitude?.message}>
              <Input
                id="partner_latitude"
                type="number"
                step="0.000001"
                placeholder={tAddress('fields.latitudePlaceholder')}
                disabled={disabled}
                value={typeof latitude === 'number' ? latitude : ''}
                onChange={(e) => onChange({ latitude: e.target.value ? Number(e.target.value) : undefined })}
              />
            </FormFieldWrapper>

            <FormFieldWrapper id="partner_longitude" label={tAddress('fields.longitude')} required={required} error={errors.longitude?.message}>
              <Input
                id="partner_longitude"
                type="number"
                step="0.000001"
                placeholder={tAddress('fields.longitudePlaceholder')}
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
              <span>{tMap('openGmaps')}</span>
            </a>
          ) : null}
        </div>
      </div>
    </SectionCard>
  )
}
