/**
 * contact-card.tsx — Supplier contact channels, tax identity and banking inspection
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { Banknote, Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { DetailRow } from '@/components/shared/detail-row'

import type { SupplierRecord } from '@/types/scm/supplier'
import type { ReactElement } from 'react'

export interface ContactCardProps {
  supplier: SupplierRecord
}

export function ContactCard({ supplier }: ContactCardProps): ReactElement {
  const t = useTranslations('scm.suppliers')

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      <SectionCard title={t('detail.sections.contact')} description={t('detail.sections.contactDesc')} icon={Phone}>
        <div className="space-y-2">
          <DetailRow label={t('detail.labels.mobile')} value={supplier.mobile || '-'} mono />
          <DetailRow label={t('detail.labels.phone')} value={supplier.phone || '-'} mono />
          <DetailRow label={t('detail.labels.email')} value={supplier.email || '-'} />
          <DetailRow label={t('detail.labels.website')} value={supplier.website || '-'} mono />
          <DetailRow label={t('detail.labels.vat')} value={supplier.vat || '-'} mono />
          <DetailRow label={t('detail.labels.nik')} value={supplier.nik || '-'} mono />
          <DetailRow label={t('detail.labels.taxName')} value={supplier.taxName || '-'} />
        </div>
      </SectionCard>

      <SectionCard title={t('detail.sections.finance')} description={t('detail.sections.financeDesc')} icon={Banknote}>
        <div className="space-y-2">
          <DetailRow
            label={t('detail.labels.paymentTerm')}
            value={t(`paymentTerms.${supplier.paymentTerm === 'COD' ? 'cod' : 'paidBeforeShipment'}`)}
          />
          <DetailRow label={t('detail.labels.legacyCode')} value={supplier.legacyCode || '-'} mono />
          <DetailRow label={t('detail.labels.bankName')} value={supplier.bankInfo?.bankName || '-'} />
          <DetailRow label={t('detail.labels.accountNumber')} value={supplier.bankInfo?.accountNumber || '-'} mono />
          <DetailRow label={t('detail.labels.accountHolder')} value={supplier.bankInfo?.accountHolder || '-'} />
        </div>
      </SectionCard>
    </div>
  )
}
