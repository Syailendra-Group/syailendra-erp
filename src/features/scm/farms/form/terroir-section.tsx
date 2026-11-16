'use client'

import { Mountain } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Controller } from 'react-hook-form'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { Input } from '@/components/ui/input'

import type { FarmFormValues } from '@/schemas/scm/farm-schema'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

export interface TerroirSectionProps {
  form: UseFormReturn<FarmFormValues>
  disabled: boolean
}

export function TerroirSection({ form, disabled }: TerroirSectionProps): ReactElement {
  const t = useTranslations('scm.farms')
  const {
    control,
    formState: { errors }
  } = form

  return (
    <SectionCard title={t('sections.terroir')} description={t('sections.terroirDesc')} icon={Mountain} contentClassName="space-y-4">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <FormFieldWrapper id="area_ha" label={t('form.fields.areaHa')} error={errors.area_ha?.message}>
          <Controller
            control={control}
            name="area_ha"
            render={({ field }) => (
              <Input
                id="area_ha"
                type="number"
                step="0.0001"
                min={0}
                placeholder={t('form.fields.areaHaPlaceholder')}
                className="font-mono text-xs"
                disabled={disabled}
                value={field.value ?? ''}
                onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
              />
            )}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="elevation_mdpl" label={t('form.fields.elevationMdpl')} error={errors.elevation_mdpl?.message}>
          <Controller
            control={control}
            name="elevation_mdpl"
            render={({ field }) => (
              <Input
                id="elevation_mdpl"
                type="number"
                min={0}
                placeholder={t('form.fields.elevationMdplPlaceholder')}
                className="font-mono text-xs"
                disabled={disabled}
                value={field.value ?? ''}
                onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
              />
            )}
          />
        </FormFieldWrapper>
      </div>
    </SectionCard>
  )
}
