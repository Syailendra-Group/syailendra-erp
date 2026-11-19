'use client'

import { useTranslations } from 'next-intl'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { Textarea } from '@/components/ui/textarea'

import type { AddressSectionProps } from '@/types/components/address'

export function AddressTextFields({ values, onChange, disabled, required, errors = {}, showStreetInput }: AddressSectionProps) {
  const t = useTranslations('common.address')
  return (
    <div className="flex flex-col gap-3.5">
      {showStreetInput && (
        <FormFieldWrapper id="street" label={t('street')} required={required} error={errors.street?.message}>
          <Textarea
            id="street"
            rows={3}
            value={values.street ?? ''}
            placeholder={t('streetPlaceholder')}
            disabled={disabled}
            aria-invalid={Boolean(errors.street)}
            aria-describedby={errors.street ? 'street-error' : undefined}
            onChange={(e) => onChange({ street: e.target.value })}
          />
        </FormFieldWrapper>
      )}
      <FormFieldWrapper id="address_detail" label={t('fields.addressDetail')} required={required} error={errors.address_detail?.message}>
        <Textarea
          id="address_detail"
          rows={3}
          value={values.address_detail ?? ''}
          placeholder={t('fields.addressDetailPlaceholder')}
          disabled={disabled}
          aria-invalid={Boolean(errors.address_detail)}
          aria-describedby={errors.address_detail ? 'address_detail-error' : undefined}
          onChange={(e) => onChange({ address_detail: e.target.value })}
        />
      </FormFieldWrapper>
      <FormFieldWrapper id="address_benchmark" label={t('benchmark')} error={errors.address_benchmark?.message}>
        <Textarea
          id="address_benchmark"
          rows={3}
          value={values.address_benchmark ?? ''}
          placeholder={t('benchmarkPlaceholder')}
          disabled={disabled}
          aria-invalid={Boolean(errors.address_benchmark)}
          aria-describedby={errors.address_benchmark ? 'address_benchmark-error' : undefined}
          onChange={(e) => onChange({ address_benchmark: e.target.value })}
        />
      </FormFieldWrapper>
    </div>
  )
}
