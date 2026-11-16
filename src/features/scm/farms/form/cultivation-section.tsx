'use client'

import { Sprout } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Controller } from 'react-hook-form'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { FARMING_SYSTEMS } from '@/schemas/scm/farm-schema'

import type { FarmFormValues } from '@/schemas/scm/farm-schema'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

export interface CultivationSectionProps {
  form: UseFormReturn<FarmFormValues>
  disabled: boolean
}

export function CultivationSection({ form, disabled }: CultivationSectionProps): ReactElement {
  const t = useTranslations('scm.farms')
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors }
  } = form
  const usesPesticide = watch('uses_pesticide')
  const usesHerbicide = watch('uses_herbicide')

  return (
    <SectionCard title={t('sections.cultivation')} description={t('sections.cultivationDesc')} icon={Sprout} contentClassName="space-y-4">
      <FormFieldWrapper id="farming_system" label={t('form.fields.farmingSystem')} required error={errors.farming_system?.message}>
        <Controller
          control={control}
          name="farming_system"
          render={({ field }) => (
            <SelectForm
              addNewAction={false}
              placeholder={t('form.fields.farmingSystemPlaceholder')}
              disabled={disabled}
              value={field.value}
              onValueChange={(value) => field.onChange(value)}
              items={FARMING_SYSTEMS.map((value) => ({ label: t(`farmingSystems.${value}`), value }))}
            />
          )}
        />
      </FormFieldWrapper>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="space-y-3 rounded-md border p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium">{t('form.fields.usesPesticide')}</p>
            <Switch
              checked={usesPesticide}
              onCheckedChange={(value) => setValue('uses_pesticide', value, { shouldDirty: true })}
              disabled={disabled}
            />
          </div>
          {usesPesticide && (
            <FormFieldWrapper id="pesticide_types" label={t('form.fields.pesticideTypes')} error={errors.pesticide_types?.message}>
              <Input
                id="pesticide_types"
                placeholder={t('form.fields.pesticideTypesPlaceholder')}
                disabled={disabled}
                {...register('pesticide_types')}
              />
            </FormFieldWrapper>
          )}
        </div>

        <div className="space-y-3 rounded-md border p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium">{t('form.fields.usesHerbicide')}</p>
            <Switch
              checked={usesHerbicide}
              onCheckedChange={(value) => setValue('uses_herbicide', value, { shouldDirty: true })}
              disabled={disabled}
            />
          </div>
          {usesHerbicide && (
            <FormFieldWrapper id="herbicide_types" label={t('form.fields.herbicideTypes')} error={errors.herbicide_types?.message}>
              <Input
                id="herbicide_types"
                placeholder={t('form.fields.herbicideTypesPlaceholder')}
                disabled={disabled}
                {...register('herbicide_types')}
              />
            </FormFieldWrapper>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <FormFieldWrapper id="fertilizer_types" label={t('form.fields.fertilizerTypes')} error={errors.fertilizer_types?.message}>
          <Input
            id="fertilizer_types"
            placeholder={t('form.fields.fertilizerTypesPlaceholder')}
            disabled={disabled}
            {...register('fertilizer_types')}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="water_source" label={t('form.fields.waterSource')} error={errors.water_source?.message}>
          <Input id="water_source" placeholder={t('form.fields.waterSourcePlaceholder')} disabled={disabled} {...register('water_source')} />
        </FormFieldWrapper>
      </div>
    </SectionCard>
  )
}
