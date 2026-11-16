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
import { useCreateCrop, useUpdateCrop } from '@/hooks/scm/use-crops'
import { CULTIVATION_STATUSES, getCropFormSchema, PLANT_PARTS } from '@/schemas/scm/crop-schema'

import type { CropFormValues } from '@/schemas/scm/crop-schema'
import type { CropRecord } from '@/types/scm/crop'
import type { ReactElement } from 'react'

export interface CropFormProps {
  selectedCrop: CropRecord | null
  isEdit: boolean
  onSuccess: () => void
  onPendingChange?: (isPending: boolean) => void
}

export function CropForm({ selectedCrop, isEdit, onSuccess, onPendingChange }: CropFormProps): ReactElement {
  const t = useTranslations('scm.crops')
  const createMutation = useCreateCrop()
  const updateMutation = useUpdateCrop()

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CropFormValues>({
    resolver: zodResolver(getCropFormSchema(t)),
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
    if (isEdit && selectedCrop) {
      reset({
        code: selectedCrop.code,
        name: selectedCrop.name,
        latin_name: selectedCrop.latinName,
        plant_part: selectedCrop.plantPart,
        cultivation_status: selectedCrop.cultivationStatus,
        lifespan_months: selectedCrop.lifespanMonths ?? undefined,
        harvest_season: selectedCrop.harvestSeason,
        harvest_frequency: selectedCrop.harvestFrequency,
        description: selectedCrop.description,
        active: selectedCrop.active
      })
    }
  }, [isEdit, selectedCrop, reset])

  const onSubmit = async (values: CropFormValues) => {
    const result =
      isEdit && selectedCrop ? await updateMutation.mutateAsync({ id: selectedCrop.id, values }) : await createMutation.mutateAsync(values)

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
    <form id="crop-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
