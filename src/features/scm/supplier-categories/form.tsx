/**
 * form.tsx — ActionDialog modal form for Supplier Categories
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useCreateSupplierCategory, useSupplierCategoryOptions, useUpdateSupplierCategory } from '@/hooks/scm/use-supplier-categories'
import { getSupplierCategoryFormSchema } from '@/schemas/scm/supplier-category-schema'

import { useSupplierCategoryContext } from './supplier-category.context'

import type { SupplierCategoryFormSchemaValues } from '@/schemas/scm/supplier-category-schema'
import type { ReactElement } from 'react'

const COLOR_OPTIONS = [
  { value: '0', label: 'Tag 0 (Default Gray)' },
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

export function SupplierCategoryFormDialog(): ReactElement {
  const t = useTranslations('scm.supplierCategories')
  const { open, setOpen, selectedCategory, setSelectedCategory } = useSupplierCategoryContext()
  const isEdit = open === 'edit' && Boolean(selectedCategory)

  const { data: parentOptions = [] } = useSupplierCategoryOptions()
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

  useEffect(() => {
    if (isEdit && selectedCategory) {
      reset({
        name: selectedCategory.name,
        parentId: selectedCategory.parentId,
        color: selectedCategory.color,
        active: selectedCategory.active
      })
    } else if (open === 'create') {
      reset({
        name: '',
        parentId: null,
        color: 0,
        active: true
      })
    }
  }, [open, isEdit, selectedCategory, reset])

  const selectParentItems = [
    { value: 'none', label: t('table.rootCategory') },
    ...parentOptions
      .filter((opt) => !selectedCategory || opt.id !== selectedCategory.id)
      .map((opt) => ({
        value: String(opt.id),
        label: opt.displayName
      }))
  ]

  const onSubmit = async (values: SupplierCategoryFormSchemaValues) => {
    try {
      if (isEdit && selectedCategory) {
        const res = await updateMutation.mutateAsync({
          id: selectedCategory.id,
          values
        })
        if (res.success) {
          toast.success(t('toast.updateSuccess'))
          setOpen(null)
          setSelectedCategory(null)
        } else {
          toast.error(res.error || t('toast.deleteError'))
        }
      } else {
        const res = await createMutation.mutateAsync(values)
        if (res.success) {
          toast.success(t('toast.createSuccess'))
          setOpen(null)
        } else {
          toast.error(res.error || t('toast.deleteError'))
        }
      }
    } catch {
      toast.error(t('toast.deleteError'))
    }
  }

  const isOpen = open === 'create' || open === 'edit'
  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <ActionDialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) {
          setOpen(null)
          setSelectedCategory(null)
        }
      }}
      title={isEdit ? t('form.editTitle') : t('form.createTitle')}
      description={t('form.description')}
      formId="supplier-category-form"
      isPending={isPending}
      isEdit={isEdit}
      maxWidth="sm:max-w-lg"
    >
      <form id="supplier-category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-1">
        <FormFieldWrapper id="category_name" label={t('form.fields.name')} required error={errors.name?.message}>
          <Input
            id="category_name"
            placeholder={t('form.fields.namePlaceholder')}
            disabled={isPending}
            className="h-8 text-xs"
            {...register('name')}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="parent_id" label={t('form.fields.parent')}>
          <SelectForm
            value={watch('parentId') ? String(watch('parentId')) : 'none'}
            onValueChange={(val) => {
              setValue('parentId', val === 'none' ? null : Number(val))
            }}
            placeholder={t('form.fields.parentPlaceholder')}
            disabled={isPending}
            items={selectParentItems}
          />
        </FormFieldWrapper>

        <FormFieldWrapper id="category_color" label={t('form.fields.color')}>
          <SelectForm
            value={String(watch('color'))}
            onValueChange={(val) => setValue('color', Number(val))}
            disabled={isPending}
            items={COLOR_OPTIONS}
          />
        </FormFieldWrapper>

        <div className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
          <div className="space-y-0.5">
            <Label className="text-xs font-medium">{t('form.fields.active')}</Label>
          </div>
          <Switch checked={watch('active')} onCheckedChange={(checked) => setValue('active', checked)} disabled={isPending} />
        </div>
      </form>
    </ActionDialog>
  )
}
