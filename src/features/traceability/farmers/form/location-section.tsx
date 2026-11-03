'use client'

import { useMemo } from 'react'
import { MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { Input } from '@/components/ui/input'
import { useDistrictsQuery } from '@/hooks/others/use-districts'
import { useProvincesQuery } from '@/hooks/others/use-provinces'
import { useRegenciesQuery } from '@/hooks/others/use-regencies'
import { useVillagesQuery } from '@/hooks/others/use-villages'

import type { FarmerFormValues } from '@/schemas/traceability/farmer-schema'
import type { MapCoordinates } from '@/types/components/map'
import type { ReactElement } from 'react'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'

export interface LocationSectionProps {
  register: UseFormRegister<FarmerFormValues>
  errors: FieldErrors<FarmerFormValues>
  watch: UseFormWatch<FarmerFormValues>
  setValue: UseFormSetValue<FarmerFormValues>
  isPending: boolean
  onCentroidChange: (coords: MapCoordinates) => void
}

export function LocationSection({ register, errors, watch, setValue, isPending, onCentroidChange }: LocationSectionProps): ReactElement {
  const tTrace = useTranslations('traceability.farmers')

  const currentStateId = watch('state_id')
  const currentCityId = watch('city_id')
  const currentDistrictId = watch('district_id')
  const currentSubdistrictId = watch('subdistrict_id')

  // Regional queries
  const { data: provinces = [] } = useProvincesQuery()
  const { data: regencies = [] } = useRegenciesQuery(currentStateId)
  const { data: districts = [] } = useDistrictsQuery(currentCityId)
  const { data: villages = [] } = useVillagesQuery(currentDistrictId)

  // Options
  const provinceOptions = useMemo(() => provinces.map((p) => ({ label: p.name, value: String(p.id) })), [provinces])

  const regencyOptions = useMemo(() => regencies.map((r) => ({ label: r.name, value: String(r.id) })), [regencies])

  const districtOptions = useMemo(() => districts.map((d) => ({ label: d.name, value: String(d.id) })), [districts])

  const villageOptions = useMemo(() => villages.map((v) => ({ label: v.name, value: String(v.id) })), [villages])

  // Handle Province change
  const handleProvinceChange = (val: string) => {
    const pId = Number(val)
    setValue('state_id', pId, { shouldValidate: true, shouldDirty: true })
    setValue('city_id', undefined, { shouldValidate: true, shouldDirty: true })
    setValue('district_id', undefined, { shouldValidate: true, shouldDirty: true })
    setValue('subdistrict_id', undefined, { shouldValidate: true, shouldDirty: true })
  }

  // Handle Regency change (triggers dynamic centroid pan)
  const handleRegencyChange = (val: string) => {
    const cId = Number(val)
    setValue('city_id', cId, { shouldValidate: true, shouldDirty: true })
    setValue('district_id', undefined, { shouldValidate: true, shouldDirty: true })
    setValue('subdistrict_id', undefined, { shouldValidate: true, shouldDirty: true })

    const selectedRegency = regencies.find((r) => r.id === cId)
    if (selectedRegency) {
      setValue('city', selectedRegency.name, { shouldValidate: true, shouldDirty: true })
      if (selectedRegency.latitude && selectedRegency.longitude) {
        onCentroidChange({
          latitude: selectedRegency.latitude,
          longitude: selectedRegency.longitude
        })
      }
    }
  }

  // Handle District change (triggers dynamic centroid pan)
  const handleDistrictChange = (val: string) => {
    const dId = Number(val)
    setValue('district_id', dId, { shouldValidate: true, shouldDirty: true })
    setValue('subdistrict_id', undefined, { shouldValidate: true, shouldDirty: true })

    const selectedDistrict = districts.find((d) => d.id === dId)
    if (selectedDistrict?.latitude && selectedDistrict.longitude) {
      onCentroidChange({
        latitude: selectedDistrict.latitude,
        longitude: selectedDistrict.longitude
      })
    }
  }

  // Handle Village change
  const handleVillageChange = (val: string) => {
    const sId = Number(val)
    setValue('subdistrict_id', sId, { shouldValidate: true, shouldDirty: true })

    const selectedVillage = villages.find((v) => v.id === sId)
    if (selectedVillage) {
      setValue('street', selectedVillage.name, { shouldValidate: true, shouldDirty: true })
      if (selectedVillage.latitude && selectedVillage.longitude) {
        onCentroidChange({
          latitude: selectedVillage.latitude,
          longitude: selectedVillage.longitude
        })
      }
    }
  }

  return (
    <SectionCard title={tTrace('sections.location')} description={tTrace('sections.locationDesc')} icon={MapPin} contentClassName="space-y-4">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {/* Provinsi */}
        <FormFieldWrapper id="state_id" label={tTrace('fields.province')} error={errors.state_id?.message}>
          <SelectForm
            placeholder={tTrace('fields.provincePlaceholder')}
            disabled={isPending}
            value={currentStateId ? String(currentStateId) : ''}
            onValueChange={handleProvinceChange}
            items={provinceOptions}
          />
        </FormFieldWrapper>

        {/* Kabupaten / Kota */}
        <FormFieldWrapper id="city_id" label={tTrace('fields.regency')} required error={errors.city?.message}>
          <SelectForm
            placeholder={tTrace('fields.regencyPlaceholder')}
            disabled={isPending || !currentStateId}
            value={currentCityId ? String(currentCityId) : ''}
            onValueChange={handleRegencyChange}
            items={regencyOptions}
          />
        </FormFieldWrapper>

        {/* Kecamatan */}
        <FormFieldWrapper id="district_id" label={tTrace('fields.district')} error={errors.district_id?.message}>
          <SelectForm
            placeholder={tTrace('fields.districtPlaceholder')}
            disabled={isPending || !currentCityId}
            value={currentDistrictId ? String(currentDistrictId) : ''}
            onValueChange={handleDistrictChange}
            items={districtOptions}
          />
        </FormFieldWrapper>

        {/* Desa / Kelurahan */}
        <FormFieldWrapper id="subdistrict_id" label={tTrace('fields.village')} required error={errors.street?.message}>
          <SelectForm
            placeholder={tTrace('fields.villagePlaceholder')}
            disabled={isPending || !currentDistrictId}
            value={currentSubdistrictId ? String(currentSubdistrictId) : ''}
            onValueChange={handleVillageChange}
            items={villageOptions}
          />
        </FormFieldWrapper>
      </div>

      {/* Alamat Detail / Petak Kebun */}
      <FormFieldWrapper id="address_detail" label={tTrace('fields.addressDetail')} error={errors.address_detail?.message}>
        <Input id="address_detail" placeholder={tTrace('fields.addressDetailPlaceholder')} disabled={isPending} {...register('address_detail')} />
      </FormFieldWrapper>
    </SectionCard>
  )
}
