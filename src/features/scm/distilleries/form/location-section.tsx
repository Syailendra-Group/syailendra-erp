'use client'

import { AddressSection } from '@/components/form/address-section'

import type { DistilleryFormValues } from '@/schemas/scm/distillery-schema'
import type { AddressFormState } from '@/types/components/address'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

export interface LocationSectionProps {
  form: UseFormReturn<DistilleryFormValues>
  disabled: boolean
}

export function LocationSection({ form, disabled }: LocationSectionProps): ReactElement {
  const values = form.watch()
  const change = (updates: Partial<AddressFormState>) => {
    if ('state_id' in updates) form.setValue('state_id', updates.state_id, { shouldDirty: true })
    if ('city_id' in updates) form.setValue('city_id', updates.city_id, { shouldDirty: true })
    if ('district_id' in updates) form.setValue('district_id', updates.district_id, { shouldDirty: true })
    if ('subdistrict_id' in updates) form.setValue('subdistrict_id', updates.subdistrict_id, { shouldDirty: true })
    if ('address_detail' in updates) form.setValue('address_detail', updates.address_detail ?? '', { shouldDirty: true })
    if ('latitude' in updates) form.setValue('latitude', updates.latitude, { shouldDirty: true })
    if ('longitude' in updates) form.setValue('longitude', updates.longitude, { shouldDirty: true })
  }
  return (
    <AddressSection
      values={{
        country_id: 100,
        state_id: values.state_id,
        city_id: values.city_id,
        district_id: values.district_id,
        subdistrict_id: values.subdistrict_id,
        address_detail: values.address_detail,
        latitude: values.latitude,
        longitude: values.longitude
      }}
      onChange={change}
      errors={form.formState.errors as Record<string, { message?: string }>}
      disabled={disabled}
    />
  )
}
