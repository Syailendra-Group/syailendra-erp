'use client'

import { useWatch } from 'react-hook-form'

import { AddressSection } from '@/components/form/address-section'

import type { AddressFormState } from '@/types/components/address'
import type { SupplierSectionProps } from '@/types/scm/supplier-form'

export function SupplierAddress({ form, disabled }: SupplierSectionProps) {
  const [countryId, stateId, cityId, districtId, subDistrictId, zip, street, addressDetail, addressBenchmark, latitude, longitude] = useWatch({
    control: form.control,
    name: [
      'countryId',
      'stateId',
      'cityId',
      'districtId',
      'subDistrictId',
      'zip',
      'street',
      'addressDetail',
      'addressBenchmark',
      'latitude',
      'longitude'
    ]
  })
  const { errors } = form.formState
  const change = (updates: Partial<AddressFormState>) => {
    const options = { shouldDirty: true, shouldValidate: true }
    if ('country_id' in updates) form.setValue('countryId', updates.country_id ?? null, options)
    if ('state_id' in updates) form.setValue('stateId', updates.state_id ?? null, options)
    if ('city_id' in updates) form.setValue('cityId', updates.city_id ?? null, options)
    if ('district_id' in updates) form.setValue('districtId', updates.district_id ?? null, options)
    if ('subdistrict_id' in updates) form.setValue('subDistrictId', updates.subdistrict_id ?? null, options)
    if ('street' in updates) form.setValue('street', updates.street ?? '', options)
    if ('zip_code' in updates) form.setValue('zip', updates.zip_code ?? '', options)
    if ('address_detail' in updates) form.setValue('addressDetail', updates.address_detail ?? '', options)
    if ('address_benchmark' in updates) form.setValue('addressBenchmark', updates.address_benchmark ?? '', options)
    if ('latitude' in updates) form.setValue('latitude', updates.latitude, options)
    if ('longitude' in updates) form.setValue('longitude', updates.longitude, options)
  }
  return (
    <AddressSection
      showStreetInput
      disabled={disabled}
      onChange={change}
      values={{
        country_id: countryId ?? undefined,
        state_id: stateId ?? undefined,
        city_id: cityId ?? undefined,
        district_id: districtId ?? undefined,
        subdistrict_id: subDistrictId ?? undefined,
        zip_code: zip,
        street,
        address_detail: addressDetail,
        address_benchmark: addressBenchmark,
        latitude,
        longitude
      }}
      errors={Object.fromEntries(
        Object.entries({
          country_id: errors.countryId,
          state_id: errors.stateId,
          city_id: errors.cityId,
          district_id: errors.districtId,
          subdistrict_id: errors.subDistrictId,
          zip_code: errors.zip,
          street: errors.street,
          address_detail: errors.addressDetail,
          address_benchmark: errors.addressBenchmark,
          latitude: errors.latitude,
          longitude: errors.longitude
        }).filter((entry): entry is [string, NonNullable<(typeof entry)[1]>] => Boolean(entry[1]))
      )}
    />
  )
}
