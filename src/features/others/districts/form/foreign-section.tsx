'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCountriesQuery } from '@/hooks/others/use-countries'
import { useProvincesQuery } from '@/hooks/others/use-provinces'
import { useRegenciesQuery } from '@/hooks/others/use-regencies'
import { getForeignSelectPlaceholder } from '@/utils/regional-helper'

import type { DistrictFormValues } from '@/schemas/others/district-schema'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

export interface ForeignDistrictSectionProps {
  form: UseFormReturn<DistrictFormValues>
  isPending: boolean
  t: (key: string) => string
}

export function ForeignDistrictSection({ form, isPending, t }: ForeignDistrictSectionProps): ReactElement {
  const tForeign = useTranslations('regional.foreignForm')
  const { data: countries = [] } = useCountriesQuery()
  const { data: allProvinces = [] } = useProvincesQuery()
  const { data: allRegencies = [] } = useRegenciesQuery()

  const selectedCountryId = form.watch('country_id')
  const selectedStateId = form.watch('state_id')
  const selectedCityId = form.watch('city_id')

  const foreignCountries = useMemo(() => countries.filter((c) => c.id !== 100).map((c) => ({ label: c.name, value: String(c.id) })), [countries])
  const foreignProvinces = useMemo(() => allProvinces.filter((p) => p.country_id && p.country_id[0] !== 100), [allProvinces])
  const foreignRegencies = useMemo(() => allRegencies.filter((r) => r.country_id && r.country_id[0] !== 100), [allRegencies])

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

  const handleSelectForeignCity = (cityIdStr: string) => {
    const cityId = Number(cityIdStr)
    form.setValue('city_id', cityId, { shouldValidate: true })
    const found = foreignRegencies.find((r) => r.id === cityId)
    if (found) {
      if (found.state_id) form.setValue('state_id', found.state_id[0], { shouldValidate: true })
      if (found.country_id) form.setValue('country_id', found.country_id[0], { shouldValidate: true })
    }
  }

  const handleSelectForeignProvince = (provIdStr: string) => {
    const provId = Number(provIdStr)
    form.setValue('state_id', provId, { shouldValidate: true })
    const found = foreignProvinces.find((p) => p.id === provId)
    if (found && found.country_id) {
      form.setValue('country_id', found.country_id[0], { shouldValidate: true })
    }
    const currentCity = foreignRegencies.find((r) => r.id === selectedCityId)
    if (currentCity && currentCity.state_id && currentCity.state_id[0] !== provId) {
      form.setValue('city_id', undefined)
    }
  }

  const handleSelectForeignCountry = (cntryIdStr: string) => {
    const cntryId = Number(cntryIdStr)
    form.setValue('country_id', cntryId, { shouldValidate: true })
    const currentProv = foreignProvinces.find((p) => p.id === selectedStateId)
    if (currentProv && currentProv.country_id && currentProv.country_id[0] !== cntryId) {
      form.setValue('state_id', undefined)
      form.setValue('city_id', undefined)
    }
  }

  return (
    <>
      <div className="space-y-3.5">
        <FormFieldWrapper id="dist-foreign-cntry" label={tForeign('countryLabel')} required>
          <SelectForm
            placeholder={tForeign('countryPlaceholder')}
            disabled={isPending}
            value={selectedCountryId ? String(selectedCountryId) : undefined}
            onValueChange={handleSelectForeignCountry}
            items={foreignCountries}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="dist-foreign-prov" label={tForeign('provinceLabel')} required>
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
            onValueChange={handleSelectForeignProvince}
            items={availableForeignProvinces}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="dist-foreign-city" label={tForeign('cityLabel')} required>
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
            onValueChange={handleSelectForeignCity}
            items={availableForeignRegencies}
          />
        </FormFieldWrapper>
      </div>

      <div className="space-y-3.5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormFieldWrapper id="dist-name" label={t('table.name')} required error={form.formState.errors.name?.message}>
                <FormControl>
                  <Input id="dist-name" placeholder={t('form.namePlaceholder')} disabled={isPending} {...field} />
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
              <FormFieldWrapper id="dist-code" label={tForeign('codeLabel')} error={form.formState.errors.code?.message}>
                <FormControl>
                  <Input id="dist-code" placeholder={tForeign('codePlaceholder')} disabled={isPending} {...field} />
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
              <FormFieldWrapper id="dist-alias" label={t('form.aliasLabel')} required error={form.formState.errors.alias?.message}>
                <FormControl>
                  <Input id="dist-alias" placeholder={t('form.aliasPlaceholder')} disabled={isPending} {...field} />
                </FormControl>
              </FormFieldWrapper>
            </FormItem>
          )}
        />
      </div>
    </>
  )
}
