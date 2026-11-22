'use client'

import { useCallback, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { createSupplierCategoryAction, updateSupplierCategoryAction } from '@/actions/scm/supplier-category.action'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { SwitchField } from '@/components/form/switch-field'
import { Input } from '@/components/ui/input'
import { getSupplierCategoryFormSchema } from '@/schemas/scm/supplier-category-schema'
import { getParentCategoryOptions, resolveSupplierCategoryError } from '@/utils/supplier-category'

import type { SupplierCategoryFormSchemaValues } from '@/schemas/scm/supplier-category-schema'
import type { SupplierCategoryRecord } from '@/types/scm/supplier-category'
import type { ReactElement } from 'react'

const COLOR_OPTIONS: { value: string; label: string }[] = [
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
  siblings: SupplierCategoryRecord[]
  onSuccess: () => void
}

export function SupplierCategoryForm({ selectedCategory, isEdit, siblings, onSuccess }: SupplierCategoryFormProps): ReactElement {
  const t = useTranslations('mitra.supplierCategories')
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors }
  } = useForm<SupplierCategoryFormSchemaValues>({
    resolver: zodResolver(getSupplierCategoryFormSchema(t)),
    defaultValues: { name: '', parentId: null, color: 0, active: true }
  })

  useEffect(() => {
    if (isEdit && selectedCategory) {
      reset({
        name: selectedCategory.name,
        parentId: selectedCategory.parentId,
        color: selectedCategory.color,
        active: selectedCategory.active
      })
    } else {
      reset({ name: '', parentId: null, color: 0, active: true })
    }
  }, [isEdit, selectedCategory, reset])

  // Only root categories may act as a parent; a category is never its own parent.
  const isGroupCategory = Boolean(isEdit && selectedCategory && selectedCategory.childCount > 0)
  const isParentLocked = isGroupCategory

  const selectParentItems = [
    { value: 'none', label: t('table.rootType') },
    ...getParentCategoryOptions(
      siblings.map((item) => ({ id: item.id, name: item.name, parentId: item.parentId })),
      selectedCategory?.id ?? null
    ).map((opt) => ({ value: String(opt.id), label: opt.name }))
  ]

  const hasSiblingWithSameName = useCallback(
    (name: string, parentId: number | null) => {
      const normalized = name.trim().toLowerCase()
      return siblings.some(
        (item) => item.id !== (selectedCategory?.id ?? -1) && item.name.trim().toLowerCase() === normalized && (item.parentId ?? null) === parentId
      )
    },
    [siblings, selectedCategory?.id]
  )

  const onSubmit = async (values: SupplierCategoryFormSchemaValues) => {
    const parentId = isGroupCategory ? null : (values.parentId ?? null)
    if (hasSiblingWithSameName(values.name, parentId)) {
      setError('name', { message: t('validation.dupPerParent') })
      toast.error(t('toast.error'))
      return
    }
    try {
      const payload = {
        name: values.name.trim(),
        parentId,
        color: values.color,
        active: values.active
      }
      const res =
        isEdit && selectedCategory ? await updateSupplierCategoryAction(selectedCategory.id, payload) : await createSupplierCategoryAction(payload)
      if (res.success) {
        toast.success(isEdit ? t('toast.updateSuccess') : t('toast.createSuccess'))
        onSuccess()
      } else {
        const message = resolveSupplierCategoryError(res.error, (key) => t(key), t('toast.error'))
        if (res.error) setError('name', { message })
        toast.error(message)
      }
    } catch {
      toast.error(t('toast.error'))
    }
  }

  return (
    <form id="supplier-category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-1">
      <FormFieldWrapper id="category_name" label={t('form.fields.name')} required error={errors.name?.message}>
        <Input id="category_name" placeholder={t('form.fields.namePlaceholder')} className="text-xs" {...register('name')} />
      </FormFieldWrapper>

      <FormFieldWrapper id="category_parent" label={t('form.fields.parent')}>
        <div className="space-y-1.5">
          <SelectForm
            value={isGroupCategory || watch('parentId') == null ? 'none' : String(watch('parentId'))}
            onValueChange={(val) => setValue('parentId', val === 'none' ? null : Number(val))}
            placeholder={t('form.fields.parentPlaceholder')}
            disabled={isParentLocked}
            items={selectParentItems}
          />
          {isGroupCategory && <p className="text-muted-foreground text-xs">{t('form.fields.parentLockedHint')}</p>}
        </div>
      </FormFieldWrapper>

      <FormFieldWrapper id="category_color" label={t('form.fields.color')}>
        <SelectForm value={String(watch('color'))} onValueChange={(val) => setValue('color', Number(val))} items={COLOR_OPTIONS} />
      </FormFieldWrapper>

      <SwitchField
        variant="card"
        label={t('form.fields.active')}
        checked={watch('active')}
        onCheckedChange={(checked) => setValue('active', checked)}
        className="rounded-lg shadow-xs"
      />
    </form>
  )
}
