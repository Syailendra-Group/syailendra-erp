'use client'

import { Building2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Controller } from 'react-hook-form'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { SwitchField } from '@/components/form/switch-field'
import { Input } from '@/components/ui/input'

import type { DistilleryFormValues } from '@/schemas/scm/distillery-schema'
import type { DistilleryPartnerOption } from '@/types/scm/distillery'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

export interface IdentitySectionProps {
  form: UseFormReturn<DistilleryFormValues>
  partnerOptions: DistilleryPartnerOption[]
  onPartnerSearch?: (search: string) => void
  disabled: boolean
}

export function IdentitySection({ form, partnerOptions, onPartnerSearch, disabled }: IdentitySectionProps): ReactElement {
  const t = useTranslations('scm.distilleries')
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors }
  } = form
  const active = watch('active')

  return (
    <SectionCard title={t('sections.identity')} description={t('sections.identityDesc')} icon={Building2} contentClassName="space-y-4">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <FormFieldWrapper id="code" label={t('fields.code')} required error={errors.code?.message}>
          <Input
            id="code"
            maxLength={20}
            placeholder={t('fields.codePlaceholder')}
            className="font-mono text-xs uppercase"
            disabled={disabled}
            {...register('code')}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="name" label={t('fields.name')} required error={errors.name?.message}>
          <Input id="name" placeholder={t('fields.namePlaceholder')} disabled={disabled} {...register('name')} />
        </FormFieldWrapper>
      </div>

      <FormFieldWrapper id="partner_id" label={t('fields.partner')} required error={errors.partner_id?.message}>
        <Controller
          control={control}
          name="partner_id"
          render={({ field }) => (
            <SelectForm
              addNewAction={false}
              placeholder={t('fields.partnerPlaceholder')}
              disabled={disabled}
              value={field.value ? String(field.value) : ''}
              onValueChange={(value) => field.onChange(Number(value))}
              onSearchChange={onPartnerSearch}
              items={partnerOptions.map((partner) => ({
                label: partner.name,
                value: String(partner.id),
                description: [partner.ref, partner.typeName].filter(Boolean).join(' | ') || undefined
              }))}
            />
          )}
        />
      </FormFieldWrapper>

      <SwitchField
        variant="card"
        icon={Building2}
        label={t('fields.active')}
        hint={t('fields.activeHint')}
        checked={active}
        onCheckedChange={(value) => setValue('active', value, { shouldDirty: true })}
        disabled={disabled}
      />
    </SectionCard>
  )
}
