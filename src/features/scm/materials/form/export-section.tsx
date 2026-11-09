'use client'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { Input } from '@/components/ui/input'

import type { MaterialFormValues } from '@/schemas/scm/material-schema'
import type { ReactElement } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

export interface MaterialExportSectionProps {
  register: UseFormRegister<MaterialFormValues>
  errors: FieldErrors<MaterialFormValues>
  t: (key: string) => string
}

export function MaterialExportSection({ register, errors, t }: MaterialExportSectionProps): ReactElement {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
      <FormFieldWrapper label={t('fields.casNumber')} error={errors.cas_number?.message} className="sm:col-span-3">
        <Input {...register('cas_number')} placeholder={t('fields.casNumberPlaceholder')} className="font-mono text-xs" />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.einecsNumber')} error={errors.einecs_number?.message} className="sm:col-span-3">
        <Input {...register('einecs_number')} placeholder={t('fields.einecsNumberPlaceholder')} className="font-mono text-xs" />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.femaNumber')} error={errors.fema_number?.message} className="sm:col-span-3">
        <Input {...register('fema_number')} placeholder={t('fields.femaNumberPlaceholder')} className="font-mono text-xs" />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.hsCode')} error={errors.hs_code?.message} required className="sm:col-span-3">
        <Input {...register('hs_code')} placeholder={t('fields.hsCodePlaceholder')} className="font-mono text-xs" />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.shelfLifeMonths')} error={errors.shelf_life_months?.message} required className="sm:col-span-6">
        <Input
          type="number"
          {...register('shelf_life_months', { valueAsNumber: true })}
          placeholder={t('fields.shelfLifeMonthsPlaceholder')}
          className="font-mono"
        />
      </FormFieldWrapper>
    </div>
  )
}
