/**
 * form.tsx — Supplier Category create/edit form (hierarchy + tag color)
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { SwitchField } from '@/components/form/switch-field'
import { Input } from '@/components/ui/input'
import { useCreateSupplierCategory, useSupplierCategoryParentOptions, useUpdateSupplierCategory } from '@/hooks/scm/use-supplier-categories'
import { getSupplierCategoryFormSchema } from '@/schemas/scm/supplier-category-schema'
import { getParentCategoryOptions, resolveSupplierCategoryError } from '@/utils/supplier-category'

import type { SupplierCategoryFormSchemaValues } from '@/schemas/scm/supplier-category-schema'
import type { SupplierCategoryRecord } from '@/types/scm/supplier-category'
import type { ReactElement } from 'react'

const COLOR_OPTIONS = [
  { value: '0', label: 'Tag 0 (Slate)' },
  { value: '1', label: 'Tag 1 (Red)' },
  { value: '2', label: 'Tag 2 (Orange)' },
  { value: '3', label: 'Tag 3 (Amber)' },
  { value: '4', label: 'Tag 4 (Yellow)' },
  { value: '5', label: 'Tag 5 (Emerald)' },
  { value: '6', label: 'Tag 6 (Teal)' },
  { value: '7', label: 'Tag 7 (Cyan)' },
  { value: '8', label: 'Tag 8 (Blue)' },
  { value: '9', label: 'Tag 9 (Indigo)' },
  { value: '10', label: 'Tag 10 (Violet)' },
  { value: '11', label: 'Tag 11 (Purple)' }
]

export interface SupplierCategoryFormProps {
  selectedCategory: SupplierCategoryRecord | null
  isEdit: boolean
  onSuccess: () => void
  onPendingChange?: (isPending: boolean) => void
}

export function SupplierCategoryForm({ selectedCategory, isEdit, onSuccess, onPendingChange }: SupplierCategoryFormProps): ReactElement {
  const t = useTranslations('scm.supplierCategories')
  const { data: parentOptions = [] } = useSupplierCategoryParentOptions()
  const createMutation = useCreateSupplierCategory()
  const updateMutation = useUpdateSupplierCategory()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<SupplierCategoryFormSchemaValues>({
    resolver: zodResolver(getSupplierCategoryFormSchema(t)),
    defaultValues: {
      name: '',
      parentId: null,
      color: 0,
      active: true
    }
  })

  const isPending = createMutation.isPending || updateMutation.isPending
  // A category that already owns sub-categories stays at the top level.
  const isGroupCategory = Boolean(isEdit && selectedCategory && selectedCategory.childCount > 0)
  const isParentLocked = isGroupCategory || isPending

  useEffect(() => {
    onPendingChange?.(isPending)
  }, [isPending, onPendingChange])

  useEffect(() => {
    if (isEdit && selectedCategory) {
      reset({
        name: selectedCategory.name,
        parentId: selectedCategory.parentId,
        color: selectedCategory.color,
        active: selectedCategory.active
      })
    } else {
      reset({
        name: '',
        parentId: null,
        color: 0,
        active: true
      })
    }
  }, [isEdit, selectedCategory, reset])

  const selectParentItems = [
    { value: 'none', label: t('table.rootType') },
    ...getParentCategoryOptions(parentOptions, selectedCategory?.id ?? null).map((opt) => ({
      value: String(opt.id),
      label: opt.name
    }))
  ]

  const onSubmit = async (values: SupplierCategoryFormSchemaValues) => {
    const payload = isGroupCategory ? { ...values, parentId: null } : values
    try {
      if (isEdit && selectedCategory) {
        const res = await updateMutation.mutateAsync({ id: selectedCategory.id, values: payload })
        if (res.success) {
          toast.success(t('toast.updateSuccess'))
          onSuccess()
        } else {
          toast.error(resolveSupplierCategoryError(res.error, (key) => t(key), t('toast.saveError')))
        }
      } else {
        const res = await createMutation.mutateAsync(payload)
        if (res.success) {
          toast.success(t('toast.createSuccess'))
          onSuccess()
        } else {
          toast.error(resolveSupplierCategoryError(res.error, (key) => t(key), t('toast.saveError')))
        }
      }
    } catch (error) {
      toast.error(resolveSupplierCategoryError(error instanceof Error ? error.message : undefined, (key) => t(key), t('toast.saveError')))
    }
  }

  return (
    <form id="supplier-category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-1">
      <FormFieldWrapper id="category_name" label={t('form.fields.name')} required error={errors.name?.message}>
        <Input id="category_name" placeholder={t('form.fields.namePlaceholder')} disabled={isPending} className="text-xs" {...register('name')} />
      </FormFieldWrapper>

      <FormFieldWrapper id="category_parent" label={t('form.fields.parent')}>
        <div className="space-y-1.5">
          <SelectForm
            value={isGroupCategory || !watch('parentId') ? 'none' : String(watch('parentId'))}
            onValueChange={(val) => {
              setValue('parentId', val === 'none' ? null : Number(val))
            }}
            placeholder={t('form.fields.parentPlaceholder')}
            disabled={isParentLocked}
            items={selectParentItems}
          />
          {isGroupCategory && <p className="text-muted-foreground text-xs">{t('form.fields.parentLockedHint')}</p>}
        </div>
      </FormFieldWrapper>

      <FormFieldWrapper id="category_color" label={t('form.fields.color')}>
        <SelectForm
          value={String(watch('color'))}
          onValueChange={(val) => setValue('color', Number(val))}
          disabled={isPending}
          items={COLOR_OPTIONS}
        />
      </FormFieldWrapper>

      <SwitchField
        variant="card"
        label={t('form.fields.active')}
        checked={watch('active')}
        onCheckedChange={(checked) => setValue('active', checked)}
        disabled={isPending}
        className="rounded-lg shadow-xs"
      />
    </form>
  )
}
