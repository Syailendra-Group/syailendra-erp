'use client'

import { Flame } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Controller } from 'react-hook-form'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'

import { DistilleryNumberField } from './number-field'
import { getDistilleryOptions } from './options'

import type { SelectOption } from '@/components/form/select-form'
import type { DistilleryFormValues } from '@/schemas/scm/distillery-schema'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

export interface SpecSectionProps {
  form: UseFormReturn<DistilleryFormValues>
  disabled: boolean
}

export function SpecSection({ form, disabled }: SpecSectionProps): ReactElement {
  const t = useTranslations('scm.distilleries')
  const {
    control,
    formState: { errors }
  } = form
  const { methodOptions, materialOptions, fuelOptions } = getDistilleryOptions(t)

  const renderSelect = (
    name: 'distillation_method' | 'boiler_material' | 'fuel_type',
    label: string,
    placeholder: string,
    options: SelectOption[],
    error: string | undefined
  ) => (
    <FormFieldWrapper id={name} label={label} required error={error}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <SelectForm
            addNewAction={false}
            placeholder={placeholder}
            disabled={disabled}
            value={field.value ? String(field.value) : ''}
            onValueChange={(value) => field.onChange(value)}
            items={options}
          />
        )}
      />
    </FormFieldWrapper>
  )

  return (
    <SectionCard title={t('sections.spec')} description={t('sections.specDesc')} icon={Flame} contentClassName="space-y-4">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {renderSelect('distillation_method', t('fields.method'), t('fields.methodPlaceholder'), methodOptions, errors.distillation_method?.message)}
        {renderSelect('fuel_type', t('fields.fuelType'), t('fields.fuelTypePlaceholder'), fuelOptions, errors.fuel_type?.message)}
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <DistilleryNumberField
          control={control}
          name="boiler_count"
          label={t('fields.boilerCount')}
          placeholder={t('fields.boilerCountPlaceholder')}
          error={errors.boiler_count?.message}
          step="1"
          min={1}
          required
          disabled={disabled}
        />
        <DistilleryNumberField
          control={control}
          name="boiler_capacity_kg"
          label={t('fields.boilerCapacity')}
          placeholder={t('fields.boilerCapacityPlaceholder')}
          error={errors.boiler_capacity_kg?.message}
          required
          disabled={disabled}
        />
        {renderSelect('boiler_material', t('fields.material'), t('fields.materialPlaceholder'), materialOptions, errors.boiler_material?.message)}
      </div>

      <DistilleryNumberField
        control={control}
        name="facility_area_m2"
        label={t('fields.facilityArea')}
        placeholder={t('fields.facilityAreaPlaceholder')}
        error={errors.facility_area_m2?.message}
        disabled={disabled}
      />
    </SectionCard>
  )
}
