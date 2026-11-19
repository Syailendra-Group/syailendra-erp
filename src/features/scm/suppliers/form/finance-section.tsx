/**
 * finance-section.tsx — Payment terms, banking information, and record status
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { CreditCard } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Controller, useWatch } from 'react-hook-form'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { RestrictedField } from '@/components/form/restricted-field'
import { SelectForm } from '@/components/form/select-form'
import { SwitchField } from '@/components/form/switch-field'
import { TextField } from '@/components/form/text-field'

import type { SupplierSectionProps } from '@/types/scm/supplier-form'

export function FinanceSection({ form, disabled = false }: SupplierSectionProps) {
  const t = useTranslations('scm.suppliers')
  const active = useWatch({ control: form.control, name: 'active' })

  return (
    <SectionCard title={t('form.sections.finance')} description={t('form.sections.financeDesc')} icon={CreditCard} contentClassName="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={form.control}
          name="paymentTerm"
          render={({ field, fieldState }) => (
            <FormFieldWrapper id="paymentTerm" label={t('form.fields.paymentTerm')} required error={fieldState.error?.message}>
              <SelectForm
                id="paymentTerm"
                name={field.name}
                inputRef={field.ref}
                onBlur={field.onBlur}
                aria-invalid={Boolean(fieldState.error)}
                aria-describedby={fieldState.error ? 'paymentTerm-error' : undefined}
                value={field.value}
                onValueChange={field.onChange}
                disabled={disabled}
                addNewAction={false}
                placeholder={t('form.fields.paymentTermPlaceholder')}
                items={[
                  { value: 'COD', label: t('paymentTerms.cod') },
                  { value: 'PAID_BEFORE_SHIPMENT', label: t('paymentTerms.paidBeforeShipment') }
                ]}
              />
            </FormFieldWrapper>
          )}
        />
        <RestrictedField
          control={form.control}
          name="legacyCode"
          mode="code"
          label={t('form.fields.legacyCode')}
          placeholder={t('form.fields.legacyCodePlaceholder')}
          maxLength={32}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TextField
          control={form.control}
          name="bankName"
          label={t('form.fields.bankName')}
          placeholder={t('form.fields.bankNamePlaceholder')}
          maxLength={64}
          disabled={disabled}
        />
        <TextField
          control={form.control}
          name="accountNumber"
          label={t('form.fields.accountNumber')}
          placeholder={t('form.fields.accountNumberPlaceholder')}
          maxLength={32}
          mono
          disabled={disabled}
        />
        <TextField
          control={form.control}
          name="accountHolder"
          label={t('form.fields.accountHolder')}
          placeholder={t('form.fields.accountHolderPlaceholder')}
          maxLength={64}
          disabled={disabled}
        />
      </div>

      <SwitchField
        id="active"
        ariaLabel={t('form.fields.active')}
        variant="card"
        label={t('form.fields.active')}
        hint={active ? t('table.status.active') : t('table.status.archived')}
        checked={active}
        disabled={disabled}
        onCheckedChange={(checked) => form.setValue('active', checked, { shouldDirty: true })}
      />
    </SectionCard>
  )
}
