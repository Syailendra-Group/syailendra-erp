'use client'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { ParentEntityAlert } from '@/components/form/parent-entity-alert'
import { SelectForm } from '@/components/form/select-form'
import { FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import type { RegencyFormValues } from '@/schemas/others/regency-schema'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

export interface DomesticRegencySectionProps {
  form: UseFormReturn<RegencyFormValues>
  isPending: boolean
  isLoadingCatalog: boolean
  currentCode?: string
  currentName?: string
  catalogOptions: Array<{ label: string; value: string }>
  selectedProvName: string
  parentStatus?: { exists: boolean; id?: number }
  isCheckingParent: boolean
  autoAddProvince?: boolean
  isDuplicate: boolean
  duplicateId?: number
  onSelectDomestic: (code: string) => void
  t: (key: string) => string
  tReg: (key: string, values?: Record<string, string | number>) => string
  tToast: (key: string) => string
}

export function DomesticRegencySection({
  form,
  isPending,
  isLoadingCatalog,
  currentCode,
  currentName,
  catalogOptions,
  selectedProvName,
  parentStatus,
  isCheckingParent,
  autoAddProvince,
  isDuplicate,
  duplicateId,
  onSelectDomestic,
  t,
  tReg,
  tToast
}: DomesticRegencySectionProps): ReactElement {
  return (
    <>
      <FormFieldWrapper id="catalog-regency" label={t('form.catalogLabel')} required>
        <SelectForm
          placeholder={isLoadingCatalog ? tReg('placeholders.loadingCatalog', { entity: tReg('entities.regency') }) : t('form.catalogPlaceholder')}
          disabled={isPending || isLoadingCatalog}
          value={currentCode || undefined}
          onValueChange={onSelectDomestic}
          items={catalogOptions}
          onAddNewClick={() => {
            form.setValue('is_domestic', false)
            toastInfo(tToast('switchedToForeign'))
          }}
        />
      </FormFieldWrapper>

      <ParentEntityAlert
        parentLabel={tReg('parentAlert.parentProvince')}
        parentName={selectedProvName}
        entityTypeLabel={tReg('entities.regency')}
        parentTypeLabel={tReg('entities.province')}
        isChecking={isCheckingParent}
        exists={Boolean(parentStatus?.exists)}
        autoAdd={Boolean(autoAddProvince)}
        onAutoAddChange={(checked: boolean) => form.setValue('auto_add_province', checked)}
        isDuplicate={isDuplicate}
        duplicateId={duplicateId}
        currentName={currentName}
      />

      <FormField
        control={form.control}
        name="alias"
        render={({ field }) => (
          <FormItem>
            <FormFieldWrapper id="reg-alias" label={t('form.aliasLabel')} required error={form.formState.errors.alias?.message}>
              <FormControl>
                <Input id="reg-alias" placeholder={t('form.aliasPlaceholder')} disabled={isPending} {...field} />
              </FormControl>
            </FormFieldWrapper>
          </FormItem>
        )}
      />
    </>
  )
}

function toastInfo(msg: string) {
  import('sonner').then(({ toast }) => toast.info(msg))
}
