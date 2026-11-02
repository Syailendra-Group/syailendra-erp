'use client'

import { Sprout } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { Input } from '@/components/ui/input'

import type { SelectOption } from '@/components/form/select-form'
import type { FarmerFormValues } from '@/schemas/traceability/farmer-schema'
import type { ReactElement } from 'react'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'

export interface CommoditySectionProps {
  register: UseFormRegister<FarmerFormValues>
  errors: FieldErrors<FarmerFormValues>
  watch: UseFormWatch<FarmerFormValues>
  setValue: UseFormSetValue<FarmerFormValues>
  commodityOptions: SelectOption[]
  methodOptions: SelectOption[]
  isPending: boolean
}

export function CommoditySection({
  register,
  errors,
  watch,
  setValue,
  commodityOptions,
  methodOptions,
  isPending
}: CommoditySectionProps): ReactElement {
  const tTrace = useTranslations('traceability.farmers')
  const currentCommodity = watch('commodity')
  const currentMethod = watch('farming_method')

  return (
    <SectionCard title={tTrace('sections.commodity')} description={tTrace('sections.commodityDesc')} icon={Sprout} contentClassName="space-y-3.5">
      <FormFieldWrapper id="commodity" label={tTrace('fields.commodity')} required error={errors.commodity?.message}>
        <SelectForm
          value={currentCommodity}
          onValueChange={(val) => setValue('commodity', val, { shouldValidate: true })}
          disabled={isPending}
          addNewAction={true}
          addNewHref="/inventory"
          addNewLabel={tTrace('actions.addCommodity')}
          items={commodityOptions}
        />
      </FormFieldWrapper>

      <FormFieldWrapper id="farming_method" label={tTrace('fields.farmingMethod')}>
        <SelectForm
          value={currentMethod}
          onValueChange={(val) => setValue('farming_method', val, { shouldValidate: true })}
          disabled={isPending}
          items={methodOptions}
        />
      </FormFieldWrapper>

      <FormFieldWrapper id="land_area_m2" label={`${tTrace('fields.landArea')} (m²)`} error={errors.land_area_m2?.message}>
        <Input
          id="land_area_m2"
          type="number"
          placeholder={tTrace('fields.landAreaPlaceholder')}
          disabled={isPending}
          {...register('land_area_m2', { valueAsNumber: true })}
        />
      </FormFieldWrapper>
    </SectionCard>
  )
}
