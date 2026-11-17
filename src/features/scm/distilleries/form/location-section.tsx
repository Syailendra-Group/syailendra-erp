'use client'

import { MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Controller } from 'react-hook-form'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { FileDropzone } from '@/components/image/file-dropzone'
import { Textarea } from '@/components/ui/textarea'
import { useDistrictsQuery } from '@/hooks/others/use-districts'
import { useProvincesQuery } from '@/hooks/others/use-provinces'
import { useRegenciesQuery } from '@/hooks/others/use-regencies'
import { useVillagesQuery } from '@/hooks/others/use-villages'

import { DistilleryNumberField } from './number-field'

import type { DistilleryFormValues } from '@/schemas/scm/distillery-schema'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

export interface LocationSectionProps {
  form: UseFormReturn<DistilleryFormValues>
  disabled: boolean
}

const INDONESIA_COUNTRY_ID = 100

export function LocationSection({ form, disabled }: LocationSectionProps): ReactElement {
  const t = useTranslations('scm.distilleries')
  const tAddress = useTranslations('common.address')
  const {
    control,
    watch,
    setValue,
    formState: { errors }
  } = form

  const stateId = watch('state_id')
  const cityId = watch('city_id')
  const districtId = watch('district_id')

  const { data: provinces = [] } = useProvincesQuery(INDONESIA_COUNTRY_ID)
  const { data: regencies = [] } = useRegenciesQuery(stateId)
  const { data: districts = [] } = useDistrictsQuery(cityId)
  const { data: villages = [] } = useVillagesQuery(districtId)

  const toOptions = (rows: { id: number; name: string }[]) => rows.map((row) => ({ label: row.name, value: String(row.id) }))

  const renderRegion = (
    name: 'state_id' | 'city_id' | 'district_id' | 'subdistrict_id',
    label: string,
    placeholder: string,
    options: { label: string; value: string }[],
    enabled: boolean,
    onSelect: (value: string) => void
  ) => (
    <FormFieldWrapper id={name} label={label} error={errors[name]?.message}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <SelectForm
            addNewAction={false}
            placeholder={placeholder}
            disabled={disabled || !enabled}
            value={field.value ? String(field.value) : ''}
            onValueChange={onSelect}
            items={options}
          />
        )}
      />
    </FormFieldWrapper>
  )

  return (
    <SectionCard title={t('sections.location')} description={t('sections.locationDesc')} icon={MapPin} contentClassName="space-y-4">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {renderRegion('state_id', tAddress('fields.province'), tAddress('fields.provincePlaceholder'), toOptions(provinces), true, (value) => {
          setValue('state_id', Number(value), { shouldValidate: true, shouldDirty: true })
          setValue('city_id', undefined, { shouldDirty: true })
          setValue('district_id', undefined, { shouldDirty: true })
          setValue('subdistrict_id', undefined, { shouldDirty: true })
        })}

        {renderRegion(
          'city_id',
          tAddress('fields.regency'),
          tAddress('fields.regencyPlaceholder'),
          toOptions(regencies),
          Boolean(stateId),
          (value) => {
            setValue('city_id', Number(value), { shouldValidate: true, shouldDirty: true })
            setValue('district_id', undefined, { shouldDirty: true })
            setValue('subdistrict_id', undefined, { shouldDirty: true })
          }
        )}

        {renderRegion(
          'district_id',
          tAddress('fields.district'),
          tAddress('fields.districtPlaceholder'),
          toOptions(districts),
          Boolean(cityId),
          (value) => {
            setValue('district_id', Number(value), { shouldValidate: true, shouldDirty: true })
            setValue('subdistrict_id', undefined, { shouldDirty: true })
          }
        )}

        {renderRegion(
          'subdistrict_id',
          tAddress('fields.village'),
          tAddress('fields.villagePlaceholder'),
          toOptions(villages),
          Boolean(districtId),
          (value) => setValue('subdistrict_id', Number(value), { shouldValidate: true, shouldDirty: true })
        )}
      </div>

      <FormFieldWrapper id="address_detail" label={t('fields.addressDetail')} error={errors.address_detail?.message}>
        <Controller
          control={control}
          name="address_detail"
          render={({ field }) => (
            <Textarea
              id="address_detail"
              rows={3}
              placeholder={t('fields.addressDetailPlaceholder')}
              disabled={disabled}
              value={field.value ?? ''}
              onChange={(event) => field.onChange(event.target.value)}
            />
          )}
        />
      </FormFieldWrapper>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <DistilleryNumberField
          control={control}
          name="latitude"
          label={tAddress('fields.latitude')}
          placeholder={tAddress('fields.latitudePlaceholder')}
          error={errors.latitude?.message}
          step="0.000001"
          min={-90}
          disabled={disabled}
        />
        <DistilleryNumberField
          control={control}
          name="longitude"
          label={tAddress('fields.longitude')}
          placeholder={tAddress('fields.longitudePlaceholder')}
          error={errors.longitude?.message}
          step="0.000001"
          min={-180}
          disabled={disabled}
        />
      </div>

      <FormFieldWrapper id="photo_distillery" label={t('fields.photo')} error={errors.photo_distillery?.message}>
        <Controller
          control={control}
          name="photo_distillery"
          render={({ field }) => (
            <FileDropzone
              value={field.value ?? null}
              onChange={(value) => field.onChange(typeof value === 'string' ? value : null)}
              valueMode="base64"
              disabled={disabled}
              maxImageSize={2}
            />
          )}
        />
      </FormFieldWrapper>
    </SectionCard>
  )
}
