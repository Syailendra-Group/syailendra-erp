'use client'

import { useTranslations } from 'next-intl'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { getForeignSelectPlaceholder } from '@/utils/regional-helper'

import type { RegencyFormValues } from '@/schemas/others/regency-schema'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

export interface ForeignRegencySectionProps {
  form: UseFormReturn<RegencyFormValues>
  isPending: boolean
  foreignCountries: { label: string; value: string }[]
  availableForeignProvinces: { label: string; value: string }[]
  selectedCountryId?: number
  selectedStateId?: number
  onCountryChange: (val: string) => void
  onProvinceChange: (val: string) => void
  t: (key: string) => string
}

export function ForeignRegencySection({
  form,
  isPending,
  foreignCountries,
  availableForeignProvinces,
  selectedCountryId,
  selectedStateId,
  onCountryChange,
  onProvinceChange,
  t
}: ForeignRegencySectionProps): ReactElement {
  const tForeign = useTranslations('regional.foreignForm')

  return (
    <>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <FormFieldWrapper id="reg-foreign-cntry" label={tForeign('countryLabel')} required>
          <SelectForm
            placeholder={tForeign('countryPlaceholder')}
            disabled={isPending}
            value={selectedCountryId ? String(selectedCountryId) : undefined}
            onValueChange={onCountryChange}
            items={foreignCountries}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="reg-foreign-prov" label={tForeign('provinceLabel')} required>
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
            onValueChange={onProvinceChange}
            items={availableForeignProvinces}
          />
        </FormFieldWrapper>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormFieldWrapper id="reg-name" label={t('table.name')} required error={form.formState.errors.name?.message}>
                <FormControl>
                  <Input id="reg-name" placeholder={t('form.namePlaceholder')} disabled={isPending} {...field} />
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
              <FormFieldWrapper id="reg-code" label={tForeign('codeLabel')} error={form.formState.errors.code?.message}>
                <FormControl>
                  <Input id="reg-code" placeholder={tForeign('codePlaceholder')} disabled={isPending} {...field} />
                </FormControl>
              </FormFieldWrapper>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="alias"
        render={({ field }) => (
          <FormItem>
            <FormFieldWrapper id="reg-alias" label={t('form.aliasLabel')} required error={form.formState.errors.alias?.message}>
              <FormControl>
                <Input id="reg-alias" placeholder={t('form.aliasPlaceholder')} disabled={isPending} {...field} />
              </FormControl>
            </FormFieldWrapper>
          </FormItem>
        )}
      />
    </>
  )
}
