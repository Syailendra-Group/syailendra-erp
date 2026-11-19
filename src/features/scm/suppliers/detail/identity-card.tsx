/**
 * identity-card.tsx — Supplier identity, classification, ownership and legality inspection
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { IdCard } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { DataBadge } from '@/components/shared/data-badge'
import { DetailRow } from '@/components/shared/detail-row'

import type { SupplierRecord } from '@/types/scm/supplier'
import type { ReactElement } from 'react'

export interface IdentityCardProps {
  supplier: SupplierRecord
}

export function IdentityCard({ supplier }: IdentityCardProps): ReactElement {
  const t = useTranslations('scm.suppliers')
  const tCommon = useTranslations('common')

  return (
    <SectionCard title={t('detail.sections.identity')} description={t('detail.sections.identityDesc')} icon={IdCard}>
      <div className="grid grid-cols-1 gap-x-8 gap-y-0 md:grid-cols-2">
        <DetailRow label={t('detail.labels.code')} value={supplier.ref} mono />
        <DetailRow label={t('detail.labels.digitalCode')} value={supplier.digitalCode || '-'} mono />
        <DetailRow
          label={t('detail.labels.supplierType')}
          value={
            supplier.supplierTypeName ? (
              <span className="inline-flex items-center gap-2">
                <span className="font-medium">{supplier.supplierTypeName}</span>
                {supplier.needsReview ? <DataBadge variant="warning">{t('detail.labels.needsReview')}</DataBadge> : null}
              </span>
            ) : (
              '-'
            )
          }
        />
        <DetailRow
          label={t('detail.labels.status')}
          value={
            <DataBadge variant={supplier.active ? 'success' : 'neutral'}>
              {supplier.active ? tCommon('status.active') : tCommon('status.inactive')}
            </DataBadge>
          }
        />
        <DetailRow
          label={t('detail.labels.categories')}
          value={
            supplier.categoryNames.length > 0 ? (
              <span className="flex flex-wrap gap-1.5">
                {supplier.categoryNames.map((name) => (
                  <DataBadge key={name}>{name}</DataBadge>
                ))}
              </span>
            ) : (
              '-'
            )
          }
        />
        <DetailRow label={t('detail.labels.businessForm')} value={t(`detail.businessForms.${supplier.companyType}`)} />
        <DetailRow label={t('detail.labels.ownerName')} value={supplier.ownerName || '-'} />
        <DetailRow
          label={t('detail.labels.pic')}
          value={supplier.picName ? `${supplier.picName}${supplier.picPosition ? ` - ${supplier.picPosition}` : ''}` : '-'}
        />
        <DetailRow label={t('detail.labels.joinYear')} value={supplier.joinYear ? String(supplier.joinYear) : '-'} mono />
        <DetailRow label={t('detail.labels.nib')} value={supplier.nib || '-'} mono />
        <DetailRow label={t('detail.labels.businessLicense')} value={supplier.businessLicense || '-'} />
      </div>
    </SectionCard>
  )
}
