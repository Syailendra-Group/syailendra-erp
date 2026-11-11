'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCountriesQuery } from '@/hooks/others/use-countries'
import { useDistrictsQuery } from '@/hooks/others/use-districts'
import { useProvincesQuery } from '@/hooks/others/use-provinces'
import { useRegenciesQuery } from '@/hooks/others/use-regencies'
import { getForeignSelectPlaceholder } from '@/utils/regional-helper'

import type { VillageFormValues } from '@/schemas/others/village-schema'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

export interface ForeignVillageSectionProps {
  form: UseFormReturn<VillageFormValues>
  isPending: boolean
  t: (key: string) => string
}

export function ForeignVillageSection({ form, isPending, t }: ForeignVillageSectionProps): ReactElement {
  const tForeign = useTranslations('regional.foreignForm')
  const { data: countries = [] } = useCountriesQuery()
  const { data: allProvinces = [] } = useProvincesQuery()
  const { data: allRegencies = [] } = useRegenciesQuery()
  const { data: allDistricts = [] } = useDistrictsQuery()

  const selectedCountryId = form.watch('country_id')
  const selectedStateId = form.watch('state_id')
  const selectedCityId = form.watch('city_id')
  const selectedDistrictId = form.watch('district_id')

  const foreignCountries = useMemo(() => countries.filter((c) => c.id !== 100).map((c) => ({ label: c.name, value: String(c.id) })), [countries])
  const foreignProvinces = useMemo(() => allProvinces.filter((p) => p.country_id && p.country_id[0] !== 100), [allProvinces])
  const foreignRegencies = useMemo(() => allRegencies.filter((r) => r.country_id && r.country_id[0] !== 100), [allRegencies])
  const foreignDistricts = useMemo(() => allDistricts.filter((d) => d.country_id && d.country_id[0] !== 100), [allDistricts])

  const availableForeignProvinces = useMemo(() => {
    const pool =
      !selectedCountryId || selectedCountryId === 100
        ? foreignProvinces
        : foreignProvinces.filter((p) => p.country_id && p.country_id[0] === selectedCountryId)
    return pool.map((p) => ({ label: `${p.name}${p.country_id ? ` (${p.country_id[1]})` : ''}`, value: String(p.id) }))
  }, [foreignProvinces, selectedCountryId])

  const availableForeignRegencies = useMemo(() => {
    const pool = !selectedStateId ? foreignRegencies : foreignRegencies.filter((r) => r.state_id && r.state_id[0] === selectedStateId)
    return pool.map((r) => ({ label: `${r.name}${r.state_id ? ` (${r.state_id[1]})` : ''}`, value: String(r.id) }))
  }, [foreignRegencies, selectedStateId])

  const availableForeignDistricts = useMemo(() => {
    const pool = !selectedCityId ? foreignDistricts : foreignDistricts.filter((d) => d.city_id && d.city_id[0] === selectedCityId)
    return pool.map((d) => ({ label: `${d.name}${d.city_id ? ` (${d.city_id[1]})` : ''}`, value: String(d.id) }))
  }, [foreignDistricts, selectedCityId])

  const handleSelectDistrict = (distIdStr: string) => {
    const distId = Number(distIdStr)
    form.setValue('district_id', distId, { shouldValidate: true })
    const found = foreignDistricts.find((d) => d.id === distId)
    if (found) {
      if (found.city_id) form.setValue('city_id', found.city_id[0], { shouldValidate: true })
      if (found.state_id) form.setValue('state_id', found.state_id[0], { shouldValidate: true })
      if (found.country_id) form.setValue('country_id', found.country_id[0], { shouldValidate: true })
    }
  }

  const handleSelectCity = (cityIdStr: string) => {
    const cityId = Number(cityIdStr)
    form.setValue('city_id', cityId, { shouldValidate: true })
    const found = foreignRegencies.find((r) => r.id === cityId)
    if (found) {
      if (found.state_id) form.setValue('state_id', found.state_id[0], { shouldValidate: true })
      if (found.country_id) form.setValue('country_id', found.country_id[0], { shouldValidate: true })
    }
    const currentDist = foreignDistricts.find((d) => d.id === selectedDistrictId)
    if (currentDist && currentDist.city_id && currentDist.city_id[0] !== cityId) {
      form.setValue('district_id', undefined)
    }
  }

  const handleSelectProvince = (provIdStr: string) => {
    const provId = Number(provIdStr)
    form.setValue('state_id', provId, { shouldValidate: true })
    const found = foreignProvinces.find((p) => p.id === provId)
    if (found && found.country_id) {
      form.setValue('country_id', found.country_id[0], { shouldValidate: true })
    }
    const currentCity = foreignRegencies.find((r) => r.id === selectedCityId)
    if (currentCity && currentCity.state_id && currentCity.state_id[0] !== provId) {
      form.setValue('city_id', undefined)
      form.setValue('district_id', undefined)
    }
  }

  const handleSelectCountry = (cntryIdStr: string) => {
    const cntryId = Number(cntryIdStr)
    form.setValue('country_id', cntryId, { shouldValidate: true })
    const currentProv = foreignProvinces.find((p) => p.id === selectedStateId)
    if (currentProv && currentProv.country_id && currentProv.country_id[0] !== cntryId) {
      form.setValue('state_id', undefined)
      form.setValue('city_id', undefined)
      form.setValue('district_id', undefined)
    }
  }

  return (
    <>
      <div className="space-y-3.5">
        <FormFieldWrapper id="vil-foreign-cntry" label={tForeign('countryLabel')} required>
          <SelectForm
            placeholder={tForeign('countryPlaceholder')}
            disabled={isPending}
            value={selectedCountryId ? String(selectedCountryId) : undefined}
            onValueChange={handleSelectCountry}
            items={foreignCountries}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="vil-foreign-prov" label={tForeign('provinceLabel')} required>
          <SelectForm
            placeholder={getForeignSelectPlaceholder({
              poolLength: availableForeignProvinces.length,
              parentId: selectedCountryId,
              emptyWithParent: tForeign('noProvincesForCountry'),
              emptyWithoutParent: tForeign('noForeignProvinces'),
              defaultPlaceholder: tForeign('provincePlaceholder')
            })}
            disabled={isPending}
            value={selectedStateId ? String(selectedStateId) : undefined}
            onValueChange={handleSelectProvince}
            items={availableForeignProvinces}
          />
        </FormFieldWrapper>
      </div>

      <div className="space-y-3.5">
        <FormFieldWrapper id="vil-foreign-city" label={tForeign('cityLabel')} required>
          <SelectForm
            placeholder={getForeignSelectPlaceholder({
              poolLength: availableForeignRegencies.length,
              parentId: selectedStateId,
              emptyWithParent: tForeign('noCitiesForProvince'),
              emptyWithoutParent: tForeign('noForeignCities'),
              defaultPlaceholder: tForeign('cityPlaceholder')
            })}
            disabled={isPending}
            value={selectedCityId ? String(selectedCityId) : undefined}
            onValueChange={handleSelectCity}
            items={availableForeignRegencies}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="vil-foreign-dist" label={tForeign('districtLabel')} required>
          <SelectForm
            placeholder={getForeignSelectPlaceholder({
              poolLength: availableForeignDistricts.length,
              parentId: selectedCityId,
              emptyWithParent: tForeign('noDistrictsForCity'),
              emptyWithoutParent: tForeign('noForeignDistricts'),
              defaultPlaceholder: tForeign('districtPlaceholder')
            })}
            disabled={isPending}
            value={selectedDistrictId ? String(selectedDistrictId) : undefined}
            onValueChange={handleSelectDistrict}
            items={availableForeignDistricts}
          />
        </FormFieldWrapper>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormFieldWrapper id="vil-name" label={t('table.name')} required error={form.formState.errors.name?.message}>
                <FormControl>
                  <Input id="vil-name" placeholder={t('form.namePlaceholder')} disabled={isPending} {...field} />
                </FormControl>
              </FormFieldWrapper>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormFieldWrapper id="vil-code" label={tForeign('codeLabel')} error={form.formState.errors.code?.message}>
                <FormControl>
                  <Input id="vil-code" placeholder={tForeign('codePlaceholder')} disabled={isPending} {...field} />
                </FormControl>
              </FormFieldWrapper>
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-3.5">
        <FormField
          control={form.control}
          name="zip_code"
          render={({ field }) => (
            <FormItem>
              <FormFieldWrapper id="vil-zip" label={t('form.zipLabel')} error={form.formState.errors.zip_code?.message}>
                <FormControl>
                  <Input id="vil-zip" placeholder={t('form.zipPlaceholder')} disabled={isPending} {...field} />
                </FormControl>
              </FormFieldWrapper>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alias"
          render={({ field }) => (
            <FormItem>
              <FormFieldWrapper id="vil-alias" label={t('form.aliasLabel')} required error={form.formState.errors.alias?.message}>
                <FormControl>
                  <Input id="vil-alias" placeholder={t('form.aliasPlaceholder')} disabled={isPending} {...field} />
                </FormControl>
              </FormFieldWrapper>
            </FormItem>
          )}
        />
      </div>
    </>
  )
}
