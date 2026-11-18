'use client'

import { Leaf } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Controller } from 'react-hook-form'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { FileDropzone } from '@/components/image/file-dropzone'
import { Textarea } from '@/components/ui/textarea'

import type { FarmFormValues } from '@/schemas/scm/farm-schema'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

export interface SustainabilitySectionProps {
  form: UseFormReturn<FarmFormValues>
  disabled: boolean
}

export function SustainabilitySection({ form, disabled }: SustainabilitySectionProps): ReactElement {
  const t = useTranslations('scm.farms')
  const {
    control,
    register,
    formState: { errors }
  } = form

  return (
    <SectionCard title={t('sections.sustainability')} description={t('sections.sustainabilityDesc')} icon={Leaf} contentClassName="space-y-4">
      <FormFieldWrapper id="land_history" label={t('form.fields.landHistory')} error={errors.land_history?.message}>
        <Textarea
          id="land_history"
          rows={3}
          placeholder={t('form.fields.landHistoryPlaceholder')}
          className="resize-none"
          disabled={disabled}
          {...register('land_history')}
        />
      </FormFieldWrapper>

      <FormFieldWrapper id="photo_farm" label={t('form.fields.photoFarm')} error={errors.photo_farm?.message}>
        <Controller
          control={control}
          name="photo_farm"
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
