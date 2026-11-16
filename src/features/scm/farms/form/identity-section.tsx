'use client'

import { Sprout, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Controller } from 'react-hook-form'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

import type { FarmFormValues } from '@/schemas/scm/farm-schema'
import type { CropOption } from '@/types/scm/crop'
import type { FarmPartnerOption } from '@/types/scm/farm'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

export interface IdentitySectionProps {
  form: UseFormReturn<FarmFormValues>
  partnerOptions: FarmPartnerOption[]
  cropOptions: CropOption[]
  disabled: boolean
}

export function IdentitySection({ form, partnerOptions, cropOptions, disabled }: IdentitySectionProps): ReactElement {
  const t = useTranslations('scm.farms')
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors }
  } = form
  const active = watch('active')

  return (
    <SectionCard title={t('sections.identity')} description={t('sections.identityDesc')} icon={User} contentClassName="space-y-4">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <FormFieldWrapper id="code" label={t('form.fields.code')} required error={errors.code?.message}>
          <Input
            id="code"
            maxLength={20}
            placeholder={t('form.fields.codePlaceholder')}
            className="font-mono text-xs uppercase"
            disabled={disabled}
            {...register('code')}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="name" label={t('form.fields.name')} required error={errors.name?.message}>
          <Input id="name" placeholder={t('form.fields.namePlaceholder')} disabled={disabled} {...register('name')} />
        </FormFieldWrapper>
      </div>

      <FormFieldWrapper id="partner_id" label={t('form.fields.partner')} required error={errors.partner_id?.message}>
        <Controller
          control={control}
          name="partner_id"
          render={({ field }) => (
            <SelectForm
              addNewAction={false}
              placeholder={t('form.fields.partnerPlaceholder')}
              disabled={disabled}
              value={field.value ? String(field.value) : ''}
              onValueChange={(value) => field.onChange(Number(value))}
              items={partnerOptions.map((partner) => ({
                label: partner.name,
                value: String(partner.id),
                description: partner.ref || undefined
              }))}
            />
          )}
        />
      </FormFieldWrapper>

      <FormFieldWrapper id="crop_ids" label={t('form.fields.crops')} required error={errors.crop_ids?.message}>
        <Controller
          control={control}
          name="crop_ids"
          render={({ field }) => (
            <SelectForm
              multiple
              addNewAction={false}
              placeholder={t('form.fields.cropsPlaceholder')}
              disabled={disabled}
              value={(field.value || []).map(String)}
              onValueChange={(values) => field.onChange(values.map(Number))}
              items={cropOptions.map((crop) => ({
                label: crop.name,
                value: String(crop.id),
                description: crop.latinName
              }))}
            />
          )}
        />
      </FormFieldWrapper>

      <div className="flex items-center justify-between rounded-md border p-3">
        <div className="flex items-center gap-2">
          <Sprout className="text-primary size-4" />
          <div className="space-y-0.5">
            <p className="text-xs font-medium">{t('form.fields.active')}</p>
            <p className="text-muted-foreground text-[11px]">{t('form.fields.activeHint')}</p>
          </div>
        </div>
        <Switch checked={active} onCheckedChange={(value) => setValue('active', value, { shouldDirty: true })} disabled={disabled} />
      </div>
    </SectionCard>
  )
}
