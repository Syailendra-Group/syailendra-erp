'use client'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { Input } from '@/components/ui/input'

import type { SelectOption } from '@/components/form/select-form'
import type { MaterialFormValues } from '@/schemas/sbi/scm/material-schema'
import type { ReactElement } from 'react'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'

export interface MaterialCommercialSectionProps {
  register: UseFormRegister<MaterialFormValues>
  errors: FieldErrors<MaterialFormValues>
  watch: UseFormWatch<MaterialFormValues>
  setValue: UseFormSetValue<MaterialFormValues>
  categoryOptions: SelectOption[]
  methodOptions: SelectOption[]
  aromaOptions: SelectOption[]
  uomOptions: SelectOption[]
  trackingOptions: SelectOption[]
  t: (key: string) => string
}

export function MaterialCommercialSection({
  register,
  errors,
  watch,
  setValue,
  categoryOptions,
  methodOptions,
  aromaOptions,
  uomOptions,
  trackingOptions,
  t
}: MaterialCommercialSectionProps): ReactElement {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
      <FormFieldWrapper label={t('fields.defaultCode')} error={errors.default_code?.message} required className="sm:col-span-2">
        <Input {...register('default_code')} placeholder={t('fields.defaultCodePlaceholder')} className="font-mono text-xs uppercase" />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.name')} error={errors.name?.message} required className="sm:col-span-4">
        <Input {...register('name')} placeholder={t('fields.namePlaceholder')} />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.commercialName')} error={errors.commercial_name?.message} className="sm:col-span-3">
        <Input {...register('commercial_name')} placeholder={t('fields.commercialNamePlaceholder')} />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.category')} error={errors.category?.message} required className="sm:col-span-3">
        <SelectForm
          value={watch('category')}
          onValueChange={(val) => setValue('category', val as MaterialFormValues['category'])}
          items={categoryOptions}
          placeholder={t('fields.categoryPlaceholder')}
        />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.botanicalName')} error={errors.botanical_name?.message} className="sm:col-span-3">
        <Input {...register('botanical_name')} placeholder={t('fields.botanicalNamePlaceholder')} className="italic" />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.family')} error={errors.family?.message} className="sm:col-span-3">
        <Input {...register('family')} placeholder={t('fields.familyPlaceholder')} />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.inciName')} error={errors.inci_name?.message} className="sm:col-span-3">
        <Input {...register('inci_name')} placeholder={t('fields.inciNamePlaceholder')} />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.plantPart')} error={errors.plant_part?.message} className="sm:col-span-3">
        <Input {...register('plant_part')} placeholder={t('fields.plantPartPlaceholder')} />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.extractionMethod')} error={errors.extraction_method?.message} required className="sm:col-span-3">
        <SelectForm
          value={watch('extraction_method')}
          onValueChange={(val) => setValue('extraction_method', val as MaterialFormValues['extraction_method'])}
          items={methodOptions}
          placeholder={t('fields.extractionMethodPlaceholder')}
        />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.aromaNote')} error={errors.aroma_note?.message} className="sm:col-span-3">
        <SelectForm
          value={watch('aroma_note') || 'base'}
          onValueChange={(val) => setValue('aroma_note', val as MaterialFormValues['aroma_note'])}
          items={aromaOptions}
          placeholder={t('fields.aromaNotePlaceholder')}
        />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.uom')} error={errors.uom_id?.message} required className="sm:col-span-3">
        <SelectForm
          value={String(watch('uom_id') || 1)}
          onValueChange={(val) => setValue('uom_id', Number(val))}
          items={uomOptions}
          placeholder={t('fields.uomPlaceholder')}
        />
      </FormFieldWrapper>

      <FormFieldWrapper label={t('fields.tracking')} error={errors.tracking?.message} required className="sm:col-span-3">
        <SelectForm
          value={watch('tracking')}
          onValueChange={(val) => setValue('tracking', val as MaterialFormValues['tracking'])}
          items={trackingOptions}
          placeholder={t('fields.trackingPlaceholder')}
        />
      </FormFieldWrapper>
    </div>
  )
}
