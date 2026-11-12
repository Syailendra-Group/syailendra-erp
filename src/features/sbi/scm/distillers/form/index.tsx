'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useSaveDistillerMutation } from '@/hooks/sbi/scm/use-distillers'
import { getDistillerFormSchema } from '@/schemas/sbi/scm/distiller-schema'

import { getDistillerOptions } from './options'

import type { DistillerFormValues } from '@/schemas/sbi/scm/distiller-schema'
import type { DistillerRecord } from '@/types/sbi/scm/distiller'
import type { ReactElement } from 'react'

export interface DistillerFormProps {
  currentRow?: DistillerRecord | null
  onSuccess: () => void
  onPendingChange?: (isPending: boolean) => void
}

export function DistillerForm({ currentRow, onSuccess, onPendingChange }: DistillerFormProps): ReactElement {
  const tTrace = useTranslations('scm.distillers')
  const { mutateAsync: saveDistiller, isPending } = useSaveDistillerMutation()
  const isEdit = Boolean(currentRow)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<DistillerFormValues>({
    resolver: zodResolver(getDistillerFormSchema(tTrace)),
    defaultValues: {
      ref: currentRow?.ref || '',
      name: currentRow?.name || '',
      boiler_capacity_kg: currentRow?.boiler_capacity_kg || 500,
      boiler_material: currentRow?.boiler_material || 'sus316',
      method: (currentRow?.method as DistillerFormValues['method']) || 'steam',
      ownership: (currentRow?.ownership as DistillerFormValues['ownership']) || 'internal',
      sanitation_status: (currentRow?.sanitation_status as DistillerFormValues['sanitation_status']) || 'passed',
      partner_latitude: currentRow?.partner_latitude || -7.21,
      partner_longitude: currentRow?.partner_longitude || 109.91,
      operator_name: currentRow?.operator_name || '',
      phone: currentRow?.phone || '',
      street: currentRow?.street || '',
      city: currentRow?.city || 'Wonosobo',
      comment: currentRow?.comment || ''
    }
  })

  useEffect(() => {
    onPendingChange?.(isPending)
  }, [isPending, onPendingChange])

  useEffect(() => {
    if (currentRow) {
      reset({
        ref: currentRow.ref || '',
        name: currentRow.name || '',
        boiler_capacity_kg: currentRow.boiler_capacity_kg || 500,
        boiler_material: currentRow.boiler_material || 'sus316',
        method: (currentRow.method as DistillerFormValues['method']) || 'steam',
        ownership: (currentRow.ownership as DistillerFormValues['ownership']) || 'internal',
        sanitation_status: (currentRow.sanitation_status as DistillerFormValues['sanitation_status']) || 'passed',
        partner_latitude: currentRow.partner_latitude || -7.21,
        partner_longitude: currentRow.partner_longitude || 109.91,
        operator_name: currentRow.operator_name || '',
        phone: currentRow.phone || '',
        street: currentRow.street || '',
        city: currentRow.city || 'Wonosobo',
        comment: currentRow.comment || ''
      })
    }
  }, [currentRow, reset])

  const onSubmit = async (values: DistillerFormValues) => {
    try {
      const payload = isEdit && currentRow ? { ...values, id: currentRow.id } : values
      const res = await saveDistiller(payload)
      if (res.success) {
        toast.success(isEdit ? tTrace('messages.updated') : tTrace('messages.created'))
        onSuccess()
      } else {
        toast.error(res.error || tTrace('messages.error'))
      }
    } catch {
      toast.error(tTrace('messages.error'))
    }
  }

  const { methodOptions, materialOptions, ownershipOptions, sanitationOptions } = getDistillerOptions(tTrace)

  return (
    <form id="distiller-action-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-1">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormFieldWrapper id="distiller-ref" label={tTrace('fields.code')} required error={errors.ref?.message}>
          <Input id="distiller-ref" placeholder={tTrace('fields.refPlaceholder')} disabled={isPending} {...register('ref')} />
        </FormFieldWrapper>

        <FormFieldWrapper id="distiller-name" label={tTrace('fields.unitName')} required error={errors.name?.message}>
          <Input id="distiller-name" placeholder={tTrace('fields.namePlaceholder')} disabled={isPending} {...register('name')} />
        </FormFieldWrapper>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormFieldWrapper id="distiller-capacity" label={tTrace('fields.boilerCapacity')} required error={errors.boiler_capacity_kg?.message}>
          <Input
            id="distiller-capacity"
            type="number"
            placeholder={tTrace('fields.boilerCapacityPlaceholder')}
            disabled={isPending}
            {...register('boiler_capacity_kg', { valueAsNumber: true })}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="distiller-method" label={tTrace('fields.extractionMethod')} required error={errors.method?.message}>
          <SelectForm
            placeholder={tTrace('fields.methodPlaceholder')}
            disabled={isPending}
            value={watch('method')}
            onValueChange={(val) => setValue('method', val as DistillerFormValues['method'])}
            items={methodOptions}
          />
        </FormFieldWrapper>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormFieldWrapper id="distiller-material" label={tTrace('fields.material')} required error={errors.boiler_material?.message}>
          <SelectForm
            placeholder={tTrace('fields.materialPlaceholder')}
            disabled={isPending}
            value={watch('boiler_material')}
            onValueChange={(val) => setValue('boiler_material', val)}
            items={materialOptions}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="distiller-ownership" label={tTrace('fields.ownership')} required error={errors.ownership?.message}>
          <SelectForm
            placeholder={tTrace('fields.ownershipPlaceholder')}
            disabled={isPending}
            value={watch('ownership')}
            onValueChange={(val) => setValue('ownership', val as DistillerFormValues['ownership'])}
            items={ownershipOptions}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="distiller-sanitation" label={tTrace('fields.sanitation')} required error={errors.sanitation_status?.message}>
          <SelectForm
            placeholder={tTrace('fields.sanitationPlaceholder')}
            disabled={isPending}
            value={watch('sanitation_status')}
            onValueChange={(val) => setValue('sanitation_status', val as DistillerFormValues['sanitation_status'])}
            items={sanitationOptions}
          />
        </FormFieldWrapper>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormFieldWrapper id="distiller-operator" label={tTrace('fields.operator')} required error={errors.operator_name?.message}>
          <Input id="distiller-operator" placeholder={tTrace('fields.operatorNamePlaceholder')} disabled={isPending} {...register('operator_name')} />
        </FormFieldWrapper>

        <FormFieldWrapper id="distiller-phone" label={tTrace('fields.operatorPhone')} error={errors.phone?.message}>
          <Input id="distiller-phone" placeholder={tTrace('fields.phonePlaceholder')} disabled={isPending} {...register('phone')} />
        </FormFieldWrapper>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormFieldWrapper id="distiller-street" label={tTrace('fields.facilityAddress')} required error={errors.street?.message}>
          <Textarea id="distiller-street" rows={3} placeholder={tTrace('fields.streetPlaceholder')} disabled={isPending} {...register('street')} />
        </FormFieldWrapper>

        <FormFieldWrapper id="distiller-comment" label={tTrace('fields.comment')} error={errors.comment?.message}>
          <Textarea id="distiller-comment" rows={3} placeholder={tTrace('fields.commentPlaceholder')} disabled={isPending} {...register('comment')} />
        </FormFieldWrapper>
      </div>
    </form>
  )
}
