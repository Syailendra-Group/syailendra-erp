/**
 * contact-legal-section.tsx — Supplier contact channels, tax identity, ownership and legality
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { Phone, UserCog } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { NumberField } from '@/components/form/number-field'
import { TextField } from '@/components/form/text-field'

import type { SupplierSectionProps } from '@/types/scm/supplier-form'

export function ContactLegalSection({ form, disabled = false }: SupplierSectionProps) {
  const t = useTranslations('scm.suppliers')

  return (
    <div className="flex flex-col gap-6">
      <SectionCard title={t('form.sections.contact')} description={t('form.sections.contactDesc')} icon={Phone} contentClassName="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="mobile"
            label={t('form.fields.mobile')}
            placeholder={t('form.fields.mobilePlaceholder')}
            type="tel"
            maxLength={32}
            mono
            disabled={disabled}
          />
          <TextField
            control={form.control}
            name="phone"
            label={t('form.fields.phone')}
            placeholder={t('form.fields.phonePlaceholder')}
            type="tel"
            maxLength={32}
            mono
            disabled={disabled}
          />
          <TextField
            control={form.control}
            name="email"
            label={t('form.fields.email')}
            placeholder={t('form.fields.emailPlaceholder')}
            type="email"
            maxLength={128}
            disabled={disabled}
          />
          <TextField
            control={form.control}
            name="website"
            label={t('form.fields.website')}
            placeholder={t('form.fields.websitePlaceholder')}
            maxLength={128}
            mono
            disabled={disabled}
          />
          <TextField
            control={form.control}
            name="vat"
            label={t('form.fields.vat')}
            placeholder={t('form.fields.vatPlaceholder')}
            maxLength={32}
            mono
            disabled={disabled}
          />
          <TextField
            control={form.control}
            name="nik"
            label={t('form.fields.nik')}
            placeholder={t('form.fields.nikPlaceholder')}
            maxLength={32}
            mono
            disabled={disabled}
          />
        </div>
      </SectionCard>

      <SectionCard title={t('form.sections.ownership')} description={t('form.sections.ownershipDesc')} icon={UserCog} contentClassName="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="ownerName"
            label={t('form.fields.ownerName')}
            placeholder={t('form.fields.ownerNamePlaceholder')}
            maxLength={64}
            disabled={disabled}
          />
          <TextField
            control={form.control}
            name="picName"
            label={t('form.fields.picName')}
            placeholder={t('form.fields.picNamePlaceholder')}
            maxLength={64}
            disabled={disabled}
          />
          <TextField
            control={form.control}
            name="picPosition"
            label={t('form.fields.picPosition')}
            placeholder={t('form.fields.picPositionPlaceholder')}
            maxLength={64}
            disabled={disabled}
          />
          <NumberField
            control={form.control}
            name="joinYear"
            label={t('form.fields.joinYear')}
            placeholder={t('form.fields.joinYearPlaceholder')}
            min={1900}
            max={2100}
            step="1"
            disabled={disabled}
          />
          <TextField
            control={form.control}
            name="nib"
            label={t('form.fields.nib')}
            placeholder={t('form.fields.nibPlaceholder')}
            maxLength={30}
            mono
            disabled={disabled}
          />
          <TextField
            control={form.control}
            name="businessLicense"
            label={t('form.fields.businessLicense')}
            placeholder={t('form.fields.businessLicensePlaceholder')}
            maxLength={64}
            disabled={disabled}
          />
        </div>
      </SectionCard>
    </div>
  )
}
