'use client'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

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
  return (
    <>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <FormFieldWrapper id="reg-foreign-cntry" label="Negara (Luar Negeri)" required>
          <SelectForm
            placeholder="Pilih negara..."
            disabled={isPending}
            value={selectedCountryId ? String(selectedCountryId) : undefined}
            onValueChange={onCountryChange}
            items={foreignCountries}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="reg-foreign-prov" label="Provinsi / State" required>
          <SelectForm
            placeholder={
              availableForeignProvinces.length === 0
                ? selectedCountryId
                  ? 'Tidak ada provinsi terdaftar untuk negara ini...'
                  : 'Belum ada provinsi luar negeri...'
                : 'Pilih provinsi...'
            }
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
              <FormFieldWrapper id="reg-code" label="Kode (Opsional)" error={form.formState.errors.code?.message}>
                <FormControl>
                  <Input id="reg-code" placeholder="Contoh: KR-SEL" disabled={isPending} {...field} />
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
