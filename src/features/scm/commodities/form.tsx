'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { SwitchField } from '@/components/form/switch-field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateCommodity, useUpdateCommodity } from '@/hooks/scm/use-commodities'
import { CULTIVATION_STATUSES, getCommodityFormSchema, PLANT_PARTS } from '@/schemas/scm/commodity-schema'

import type { CommodityFormValues } from '@/schemas/scm/commodity-schema'
import type { CommodityRecord } from '@/types/scm/commodity'
import type { ReactElement } from 'react'

export interface CommodityFormProps {
  selectedCommodity: CommodityRecord | null
  isEdit: boolean
  onSuccess: () => void
  onPendingChange?: (isPending: boolean) => void
}

export function CommodityForm({ selectedCommodity, isEdit, onSuccess, onPendingChange }: CommodityFormProps): ReactElement {
  const t = useTranslations('scm.commodities')
  const createMutation = useCreateCommodity()
  const updateMutation = useUpdateCommodity()

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CommodityFormValues>({
    resolver: zodResolver(getCommodityFormSchema(t)),
    defaultValues: {
      code: '',
      name: '',
      latin_name: '',
      plant_part: 'leaves',
      cultivation_status: 'cultivated',
      lifespan_months: undefined,
      harvest_season: '',
      harvest_frequency: '',
      description: '',
      active: true
    }
  })

  const isPending = createMutation.isPending || updateMutation.isPending
  const active = watch('active')

  useEffect(() => {
    onPendingChange?.(isPending)
  }, [isPending, onPendingChange])

  useEffect(() => {
    if (isEdit && selectedCommodity) {
      reset({
        code: selectedCommodity.code,
        name: selectedCommodity.name,
        latin_name: selectedCommodity.latinName,
        plant_part: selectedCommodity.plantPart,
        cultivation_status: selectedCommodity.cultivationStatus,
        lifespan_months: selectedCommodity.lifespanMonths ?? undefined,
        harvest_season: selectedCommodity.harvestSeason,
        harvest_frequency: selectedCommodity.harvestFrequency,
        description: selectedCommodity.description,
        active: selectedCommodity.active
      })
    }
  }, [isEdit, selectedCommodity, reset])

  const onSubmit = async (values: CommodityFormValues) => {
    const result =
      isEdit && selectedCommodity ? await updateMutation.mutateAsync({ id: selectedCommodity.id, values }) : await createMutation.mutateAsync(values)

    if (result.success) {
      toast.success(isEdit ? t('toast.updateSuccess') : t('toast.createSuccess'))
      onSuccess()
      return
    }

    if (result.error === 'DUPLICATE_CODE') {
      toast.error(t('toast.duplicateCode'))
      return
    }

    toast.error(result.error || t('toast.saveError'))
  }

  return (
    <form id="commodity-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <FormFieldWrapper id="code" label={t('form.fields.code')} required error={errors.code?.message}>
          <Input
            id="code"
            maxLength={10}
            placeholder={t('form.fields.codePlaceholder')}
            className="font-mono text-xs uppercase"
            disabled={isPending}
            {...register('code')}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="name" label={t('form.fields.name')} required error={errors.name?.message}>
          <Input id="name" placeholder={t('form.fields.namePlaceholder')} disabled={isPending} {...register('name')} />
        </FormFieldWrapper>
      </div>

      <FormFieldWrapper id="latin_name" label={t('form.fields.latinName')} required error={errors.latin_name?.message}>
        <Input
          id="latin_name"
          placeholder={t('form.fields.latinNamePlaceholder')}
          className="italic"
          disabled={isPending}
          {...register('latin_name')}
        />
      </FormFieldWrapper>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <FormFieldWrapper id="plant_part" label={t('form.fields.plantPart')} required error={errors.plant_part?.message}>
          <Controller
            control={control}
            name="plant_part"
            render={({ field }) => (
              <SelectForm
                addNewAction={false}
                placeholder={t('form.fields.plantPartPlaceholder')}
                disabled={isPending}
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                items={PLANT_PARTS.map((value) => ({ label: t(`plantParts.${value}`), value }))}
              />
            )}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="cultivation_status" label={t('form.fields.cultivationStatus')} required error={errors.cultivation_status?.message}>
          <Controller
            control={control}
            name="cultivation_status"
            render={({ field }) => (
              <SelectForm
                addNewAction={false}
                placeholder={t('form.fields.cultivationStatusPlaceholder')}
                disabled={isPending}
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                items={CULTIVATION_STATUSES.map((value) => ({ label: t(`cultivationStatuses.${value}`), value }))}
              />
            )}
          />
        </FormFieldWrapper>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <FormFieldWrapper id="lifespan_months" label={t('form.fields.lifespanMonths')} error={errors.lifespan_months?.message}>
          <Controller
            control={control}
            name="lifespan_months"
            render={({ field }) => (
              <Input
                id="lifespan_months"
                type="number"
                min={0}
                max={600}
                placeholder={t('form.fields.lifespanMonthsPlaceholder')}
                className="font-mono text-xs"
                disabled={isPending}
                value={field.value ?? ''}
                onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
              />
            )}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="harvest_season" label={t('form.fields.harvestSeason')} error={errors.harvest_season?.message}>
          <Input id="harvest_season" placeholder={t('form.fields.harvestSeasonPlaceholder')} disabled={isPending} {...register('harvest_season')} />
        </FormFieldWrapper>

        <FormFieldWrapper id="harvest_frequency" label={t('form.fields.harvestFrequency')} error={errors.harvest_frequency?.message}>
          <Input
            id="harvest_frequency"
            placeholder={t('form.fields.harvestFrequencyPlaceholder')}
            disabled={isPending}
            {...register('harvest_frequency')}
          />
        </FormFieldWrapper>
      </div>

      <FormFieldWrapper id="description" label={t('form.fields.description')} error={errors.description?.message}>
        <Textarea
          id="description"
          rows={3}
          placeholder={t('form.fields.descriptionPlaceholder')}
          className="resize-none"
          disabled={isPending}
          {...register('description')}
        />
      </FormFieldWrapper>

      <SwitchField
        variant="card"
        label={t('form.fields.active')}
        hint={t('form.fields.activeHint')}
        checked={active}
        onCheckedChange={(value) => setValue('active', value, { shouldDirty: true })}
        disabled={isPending}
      />
    </form>
  )
}
