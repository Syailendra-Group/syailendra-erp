'use client'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import type { ProvinceFormValues } from '@/schemas/sbi/others/province-schema'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

export interface ForeignProvinceSectionProps {
  form: UseFormReturn<ProvinceFormValues>
  isPending: boolean
  countryOptions: Array<{ label: string; value: string }>
  t: (key: string) => string
  tReg: (key: string) => string
}

export function ForeignProvinceSection({ form, isPending, countryOptions, t, tReg }: ForeignProvinceSectionProps): ReactElement {
  return (
    <>
      <FormFieldWrapper id="prov-country" label={t('form.foreignCountry')} required>
        <SelectForm
          placeholder={t('form.foreignCountryPlaceholder')}
          disabled={isPending}
          value={form.watch('country_id') ? String(form.watch('country_id')) : ''}
          onValueChange={(val) => form.setValue('country_id', Number(val))}
          items={countryOptions.filter((c) => c.value !== '100')}
        />
      </FormFieldWrapper>

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormFieldWrapper id="prov-name" label={t('table.name')} required error={form.formState.errors.name?.message}>
              <FormControl>
                <Input id="prov-name" placeholder={t('form.namePlaceholder')} disabled={isPending} {...field} />
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
            <FormFieldWrapper id="prov-code" label={t('table.code')} required error={form.formState.errors.code?.message}>
              <FormControl>
                <Input id="prov-code" placeholder={t('form.codePlaceholder')} disabled={isPending} {...field} />
              </FormControl>
            </FormFieldWrapper>
          </FormItem>
        )}
      />

      {/* Prefix ID (Full Width) */}
      <FormField
        control={form.control}
        name="prefix"
        render={({ field }) => (
          <FormItem>
            <FormFieldWrapper id="prov-prefix" label={t('table.prefix')} required error={form.formState.errors.prefix?.message}>
              <FormControl>
                <Input id="prov-prefix" placeholder={t('form.prefixPlaceholder')} disabled={isPending} {...field} />
              </FormControl>
            </FormFieldWrapper>
          </FormItem>
        )}
      />

      {/* Alias Name (Full Width) */}
      <FormField
        control={form.control}
        name="alias"
        render={({ field }) => (
          <FormItem>
            <FormFieldWrapper id="prov-alias" label={tReg('fields.alias')} error={form.formState.errors.alias?.message}>
              <FormControl>
                <Input id="prov-alias" placeholder={t('form.aliasPlaceholder')} disabled={isPending} {...field} />
              </FormControl>
            </FormFieldWrapper>
          </FormItem>
        )}
      />
    </>
  )
}
