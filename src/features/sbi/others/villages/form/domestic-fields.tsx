'use client'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import type { VillageFormValues } from '@/schemas/sbi/others/village-schema'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

export interface DomesticVillageFieldsProps {
  form: UseFormReturn<VillageFormValues>
  isPending: boolean
  isLoadingCatalog: boolean
  selectedDistCode?: string
  currentCode?: string
  districtCatalogOptions: Array<{ label: string; value: string }>
  villageCatalogOptions: Array<{ label: string; value: string }>
  onSelectDistrict: (code: string) => void
  onSelectVillage: (code: string) => void
  t: (key: string) => string
  tForeign: (key: string) => string
}

export function DomesticVillageFields({
  form,
  isPending,
  isLoadingCatalog,
  selectedDistCode,
  currentCode,
  districtCatalogOptions,
  villageCatalogOptions,
  onSelectDistrict,
  onSelectVillage,
  t,
  tForeign
}: DomesticVillageFieldsProps): ReactElement {
  return (
    <>
      <FormFieldWrapper id="catalog-dist-filter" label={t('form.selectDistrictCatalog')} required>
        <SelectForm
          placeholder={tForeign('selectDistrictCatalogPlaceholder')}
          value={selectedDistCode || undefined}
          onValueChange={onSelectDistrict}
          items={districtCatalogOptions}
        />
      </FormFieldWrapper>

      <FormFieldWrapper id="catalog-village" label={t('form.selectVillageCatalog')} required>
        <SelectForm
          placeholder={
            !selectedDistCode ? t('form.selectDistrictFirst') : isLoadingCatalog ? t('form.loadingVillages') : t('form.selectVillagePlaceholder')
          }
          disabled={isPending || !selectedDistCode || isLoadingCatalog}
          value={currentCode || undefined}
          onValueChange={onSelectVillage}
          items={villageCatalogOptions}
        />
      </FormFieldWrapper>

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
    </>
  )
}
