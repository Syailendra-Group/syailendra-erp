'use client'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import type { MaterialFormValues } from '@/schemas/sbi/scm/material-schema'
import type { ReactElement } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

export interface MaterialQcSectionProps {
  register: UseFormRegister<MaterialFormValues>
  errors: FieldErrors<MaterialFormValues>
  t: (key: string) => string
}

export function MaterialQcSection({ register, errors, t }: MaterialQcSectionProps): ReactElement {
  return (
    <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-6">
      <FormFieldWrapper label={t('fields.relativeDensity')} error={errors.relative_density_20c?.message} className="sm:col-span-3">
        <Input {...register('relative_density_20c')} placeholder={t('fields.relativeDensityPlaceholder')} className="font-mono text-xs" />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.refractiveIndex')} error={errors.refractive_index_20c?.message} className="sm:col-span-3">
        <Input {...register('refractive_index_20c')} placeholder={t('fields.refractiveIndexPlaceholder')} className="font-mono text-xs" />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.opticalRotation')} error={errors.optical_rotation_20c?.message} className="sm:col-span-3">
        <Input {...register('optical_rotation_20c')} placeholder={t('fields.opticalRotationPlaceholder')} className="font-mono text-xs" />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.flashPoint')} error={errors.flash_point_c?.message} className="sm:col-span-3">
        <Input
          type="number"
          step="0.1"
          {...register('flash_point_c', { valueAsNumber: true })}
          placeholder={t('fields.flashPointPlaceholder')}
          className="font-mono text-xs"
        />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.ethanolSolubility')} error={errors.ethanol_solubility?.message} className="sm:col-span-6">
        <Input {...register('ethanol_solubility')} placeholder={t('fields.ethanolSolubilityPlaceholder')} />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.keyCompounds')} error={errors.key_compounds?.message} className="sm:col-span-6">
        <Input {...register('key_compounds')} placeholder={t('fields.keyCompoundsPlaceholder')} />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.maxMoisture')} error={errors.max_moisture_pct?.message} className="sm:col-span-3">
        <Input
          type="number"
          step="0.1"
          {...register('max_moisture_pct', { valueAsNumber: true })}
          placeholder={t('fields.maxMoisturePlaceholder')}
          className="font-mono text-xs"
        />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.minYield')} error={errors.min_yield_pct?.message} className="sm:col-span-3">
        <Input
          type="number"
          step="0.01"
          {...register('min_yield_pct', { valueAsNumber: true })}
          placeholder={t('fields.minYieldPlaceholder')}
          className="font-mono text-xs"
        />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.description')} error={errors.description?.message} className="sm:col-span-6">
        <Textarea {...register('description')} placeholder={t('fields.descriptionPlaceholder')} rows={2} />
      </FormFieldWrapper>
    </div>
  )
}
