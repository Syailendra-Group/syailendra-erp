/**
 * identity-section.tsx — Supplier identity: codes, entity type, supplier type, status, categories
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { Building2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Controller, useWatch } from 'react-hook-form'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { RestrictedField } from '@/components/form/restricted-field'
import { SelectForm } from '@/components/form/select-form'
import { SwitchField } from '@/components/form/switch-field'
import { TextField } from '@/components/form/text-field'
import { ImageDropzone } from '@/components/image/image-dropzone'
import { DetailRow } from '@/components/shared/detail-row'
import { CopyableText } from '@/components/text'
import { useSupplierCategoryOptions } from '@/hooks/scm/use-supplier-categories'
import { useSupplierTypeOptions } from '@/hooks/scm/use-supplier-types'

import type { SupplierSectionProps } from '@/types/scm/supplier-form'

export function IdentitySection({ form, digitalCode, disabled = false, isEdit = false }: Omit<SupplierSectionProps, 'recordId'>) {
  const t = useTranslations('scm.suppliers')
  const { data: categoryOptions = [] } = useSupplierCategoryOptions()
  const { data: supplierTypeOptions = [] } = useSupplierTypeOptions()
  const currentSupplierTypeId = useWatch({ control: form.control, name: 'supplierTypeId' })
  const currentVerified = useWatch({ control: form.control, name: 'supplierTypeVerified' })
  const needsReview = useWatch({ control: form.control, name: 'needsReview' })
  const active = useWatch({ control: form.control, name: 'active' })
  const profileImage = useWatch({ control: form.control, name: 'image_1920' })
  const savedProfileUrl = useWatch({ control: form.control, name: 'profileImageUrl' })
  const profilePreview = profileImage ?? savedProfileUrl

  return (
    <SectionCard title={t('form.sections.identity')} description={t('form.sections.identityDesc')} icon={Building2} contentClassName="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RestrictedField
          control={form.control}
          name="ref"
          mode="code"
          label={t('form.fields.ref')}
          placeholder={t('form.fields.refPlaceholder')}
          required
          disabled={disabled}
          readOnly={isEdit}
          maxLength={32}
        />
        <TextField
          control={form.control}
          name="name"
          label={t('form.fields.name')}
          placeholder={t('form.fields.namePlaceholder')}
          required
          disabled={disabled}
          maxLength={128}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={form.control}
          name="companyType"
          render={({ field, fieldState }) => (
            <FormFieldWrapper id="companyType" label={t('form.fields.companyType')} required error={fieldState.error?.message}>
              <SelectForm
                id="companyType"
                name={field.name}
                inputRef={field.ref}
                onBlur={field.onBlur}
                aria-invalid={Boolean(fieldState.error)}
                aria-describedby={fieldState.error ? 'companyType-error' : undefined}
                value={field.value}
                onValueChange={field.onChange}
                disabled={disabled}
                addNewAction={false}
                placeholder={t('form.fields.companyTypePlaceholder')}
                items={[
                  { value: 'company', label: t('types.company') },
                  { value: 'person', label: t('types.person') }
                ]}
              />
            </FormFieldWrapper>
          )}
        />

        <Controller
          control={form.control}
          name="supplierTypeId"
          render={({ field, fieldState }) => (
            <FormFieldWrapper id="supplierTypeId" label={t('form.fields.supplierType')} error={fieldState.error?.message}>
              <SelectForm
                id="supplierTypeId"
                name={field.name}
                inputRef={field.ref}
                onBlur={field.onBlur}
                aria-invalid={Boolean(fieldState.error)}
                aria-describedby={fieldState.error ? 'supplierTypeId-error' : undefined}
                value={field.value == null ? 'none' : String(field.value)}
                onValueChange={(value) => {
                  const nextId = value === 'none' ? null : Number(value)
                  if (nextId !== (field.value ?? null)) {
                    form.setValue('supplierTypeVerified', false, { shouldDirty: true, shouldValidate: true })
                  }
                  field.onChange(nextId)
                }}
                disabled={disabled}
                addNewAction={false}
                placeholder={t('form.fields.supplierTypePlaceholder')}
                items={[
                  { value: 'none', label: t('form.fields.supplierTypeEmpty') },
                  ...supplierTypeOptions.map((option) => ({
                    value: String(option.id),
                    label: `${option.code} - ${option.name}`
                  }))
                ]}
              />
            </FormFieldWrapper>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SwitchField
          id="active"
          variant="card"
          label={t('form.fields.active')}
          hint={t('form.fields.activeHint')}
          checked={active}
          disabled={disabled}
          onCheckedChange={(checked) => form.setValue('active', checked, { shouldDirty: true })}
        />
        <SwitchField
          id="needsReview"
          variant="card"
          label={t('form.fields.needsReview')}
          hint={t('form.fields.needsReviewHint')}
          checked={needsReview}
          disabled={disabled}
          onCheckedChange={(checked) => {
            form.setValue('needsReview', checked, { shouldDirty: true })
            form.setValue('supplierTypeVerified', !checked, { shouldDirty: true })
          }}
        />
      </div>
      <FormFieldWrapper id="image_1920" label={t('form.fields.profilePhoto')} error={form.formState.errors.image_1920?.message}>
        <ImageDropzone
          value={profilePreview}
          onChange={(value) => form.setValue('image_1920', typeof value === 'string' ? value : null, { shouldDirty: true })}
          valueMode="base64"
          aspectRatio={1}
          maxImageSize={5}
          disabled={disabled}
        />
      </FormFieldWrapper>

      <SwitchField
        id="supplierTypeVerified"
        ariaLabel={t('form.fields.supplierTypeVerified')}
        variant="card"
        label={t('form.fields.supplierTypeVerified')}
        hint={t('form.fields.supplierTypeVerifiedHint')}
        checked={currentVerified}
        disabled={!currentSupplierTypeId || disabled}
        onCheckedChange={(checked) => form.setValue('supplierTypeVerified', checked, { shouldValidate: true })}
        className="rounded-lg shadow-xs"
      />

      <Controller
        control={form.control}
        name="categoryIds"
        render={({ field, fieldState }) => (
          <FormFieldWrapper id="categoryIds" label={t('form.fields.categories')} required error={fieldState.error?.message}>
            <SelectForm
              multiple
              id="categoryIds"
              name={field.name}
              inputRef={field.ref}
              onBlur={field.onBlur}
              aria-invalid={Boolean(fieldState.error)}
              aria-describedby={fieldState.error ? 'categoryIds-error' : undefined}
              value={field.value.map(String)}
              onValueChange={(values) => field.onChange(values.map(Number))}
              disabled={disabled}
              addNewAction={false}
              placeholder={t('form.fields.categoryPlaceholder')}
              emptyText={t('form.fields.categoriesEmpty')}
              items={categoryOptions.map((option) => ({ value: String(option.id), label: option.name }))}
            />
          </FormFieldWrapper>
        )}
      />

      {digitalCode ? <DetailRow label={t('form.fields.digitalCode')} value={<CopyableText text={digitalCode} />} mono border={false} /> : null}
    </SectionCard>
  )
}
