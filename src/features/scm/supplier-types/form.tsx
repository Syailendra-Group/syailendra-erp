/**
 * form.tsx — Supplier Type create/edit form (flat master, auto code)
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SwitchField } from '@/components/form/switch-field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateSupplierType, useUpdateSupplierType } from '@/hooks/scm/use-supplier-types'
import { getSupplierTypeFormSchema } from '@/schemas/scm/supplier-type-schema'

import type { SupplierTypeFormSchemaValues } from '@/schemas/scm/supplier-type-schema'
import type { SupplierTypeRecord } from '@/types/scm/supplier-type'
import type { ReactElement } from 'react'

export interface SupplierTypeFormProps {
  selectedType: SupplierTypeRecord | null
  isEdit: boolean
  onSuccess: () => void
  onPendingChange?: (isPending: boolean) => void
}

export function SupplierTypeForm({ selectedType, isEdit, onSuccess, onPendingChange }: SupplierTypeFormProps): ReactElement {
  const t = useTranslations('scm.supplierTypes')
  const createMutation = useCreateSupplierType()
  const updateMutation = useUpdateSupplierType()

  const isPending = createMutation.isPending || updateMutation.isPending

  // Backend-driven values: the form mirrors the selected record on every render
  const formValues = useMemo<SupplierTypeFormSchemaValues>(
    () => ({
      name: selectedType?.name ?? '',
      description: selectedType?.description ?? '',
      sequence: selectedType?.sequence ?? 10,
      active: selectedType?.active ?? true
    }),
    [selectedType]
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<SupplierTypeFormSchemaValues>({
    resolver: zodResolver(getSupplierTypeFormSchema(t)),
    values: formValues
  })

  useEffect(() => {
    onPendingChange?.(isPending)
  }, [isPending, onPendingChange])

  const onSubmit = async (values: SupplierTypeFormSchemaValues) => {
    try {
      if (isEdit && selectedType) {
        const res = await updateMutation.mutateAsync({ id: selectedType.id, values })
        if (res.success) {
          toast.success(t('toast.updateSuccess'))
          onSuccess()
        } else {
          toast.error(res.error || t('toast.saveError'))
        }
      } else {
        const res = await createMutation.mutateAsync(values)
        if (res.success) {
          toast.success(t('toast.createSuccess'))
          onSuccess()
        } else {
          toast.error(res.error || t('toast.saveError'))
        }
      }
    } catch {
      toast.error(t('toast.saveError'))
    }
  }

  return (
    <form id="supplier-type-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-1">
      {isEdit && selectedType && (
        <FormFieldWrapper id="supplier_type_code" label={t('form.fields.code')}>
          <Input id="supplier_type_code" value={selectedType.code} readOnly disabled className="font-mono text-xs" />
          <p className="text-muted-foreground text-[11px]">{t('form.fields.codeHint')}</p>
        </FormFieldWrapper>
      )}

      <FormFieldWrapper id="supplier_type_name" label={t('form.fields.name')} required error={errors.name?.message}>
        <Input
          id="supplier_type_name"
          placeholder={t('form.fields.namePlaceholder')}
          disabled={isPending}
          className="text-xs"
          {...register('name')}
        />
      </FormFieldWrapper>

      <FormFieldWrapper id="supplier_type_description" label={t('form.fields.description')} error={errors.description?.message}>
        <Textarea
          id="supplier_type_description"
          placeholder={t('form.fields.descriptionPlaceholder')}
          rows={3}
          disabled={isPending}
          className="text-xs"
          {...register('description')}
        />
      </FormFieldWrapper>

      <FormFieldWrapper id="supplier_type_sequence" label={t('form.fields.sequence')} error={errors.sequence?.message}>
        <Input
          id="supplier_type_sequence"
          type="number"
          min={1}
          max={999}
          disabled={isPending}
          className="text-xs"
          {...register('sequence', { valueAsNumber: true })}
        />
      </FormFieldWrapper>

      <SwitchField
        variant="card"
        label={t('form.fields.active')}
        checked={watch('active')}
        disabled={isPending}
        className="rounded-lg shadow-xs"
        onCheckedChange={(checked) => setValue('active', checked, { shouldValidate: true })}
      />
    </form>
  )
}
