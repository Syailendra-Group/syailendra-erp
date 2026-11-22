/**
 * index.tsx — Supplier read-only detail orchestrator
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { Building2, Edit2, FileText, Star, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { LinkButton } from '@/components/button/link-button'
import { AddressCard } from '@/components/card/address-card'
import { SummaryCardGrid } from '@/components/card/summary-card'
import { MediaGallery } from '@/components/image/media-gallery'
import { LocationMapCard } from '@/components/map/location-map-card'
import { DataBadge } from '@/components/shared/data-badge'
import { PageHeader } from '@/components/shared/page-header'

import { ContactCard } from './contact-card'
import { IdentityCard } from './identity-card'

import type { SummaryCardItem } from '@/components/card/summary-card'
import type { SupplierRecord } from '@/types/scm/supplier'
import type { ReactElement } from 'react'

export interface SupplierDetailProps {
  supplier: SupplierRecord
}

export function SupplierDetail({ supplier }: SupplierDetailProps): ReactElement {
  const t = useTranslations('scm.suppliers')
  const tCommon = useTranslations('common')

  const summaryItems: SummaryCardItem[] = [
    {
      title: t('detail.summary.supplierType'),
      value: supplier.supplierTypeName || t('detail.values.unset'),
      subtitle: supplier.supplierTypeCode || t('detail.values.notRegistered'),
      icon: Building2,
      color: 'text-primary'
    },
    {
      title: t('detail.summary.status'),
      value: supplier.active ? tCommon('status.active') : tCommon('status.inactive'),
      subtitle: supplier.active ? t('detail.values.archivableActive') : t('detail.values.archived'),
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: t('detail.summary.supplierGrade'),
      value: supplier.supplierGrade ? t(`detail.grades.${supplier.supplierGrade}`) : t('detail.values.notRated'),
      subtitle: t('detail.values.assessmentPending'),
      icon: Star,
      color: 'text-amber-600'
    },
    {
      title: t('detail.summary.joinYear'),
      value: supplier.joinYear ? String(supplier.joinYear) : t('detail.values.unknown'),
      subtitle: `${supplier.farmCount} ${t('detail.values.farms')} · ${supplier.distilleryCount} ${t('detail.values.distilleries')}`,
      icon: FileText,
      color: 'text-emerald-600'
    }
  ]

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        showBack
        backHref="/scm/suppliers"
        title={supplier.name}
        description={t('detail.description')}
        titleBadge={
          <span className="border-primary/20 bg-primary/10 text-primary rounded border px-2 py-0.5 font-mono text-xs font-semibold">
            {supplier.ref}
          </span>
        }
        actions={<LinkButton href={`/scm/suppliers/${supplier.id}/edit`} icon={Edit2} label={t('detail.actions.edit')} />}
      />

      <SummaryCardGrid items={summaryItems} />

      <IdentityCard supplier={supplier} />

      <ContactCard supplier={supplier} />

      <MediaGallery model="res.partner" recordId={supplier.id} role="gallery" readOnly legacyImageUrl={supplier.imageUrl} />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <AddressCard
          countryName={supplier.countryName}
          stateName={supplier.stateName}
          cityName={supplier.cityName}
          districtName={supplier.districtName}
          villageName={supplier.subDistrictName}
          zipCode={supplier.zip}
          addressDetail={supplier.addressDetail || supplier.street}
          benchmark={supplier.addressBenchmark}
          title={t('detail.sections.address')}
          description={t('detail.sections.addressDesc')}
        />
        <LocationMapCard
          latitude={supplier.latitude}
          longitude={supplier.longitude}
          title={supplier.name}
          description={supplier.cityName || supplier.stateName}
          markerLabel={supplier.name}
          markerPopup={supplier.addressDetail || supplier.street}
        />
      </div>
    </div>
  )
}

export function SupplierNotFound(): ReactElement {
  const t = useTranslations('scm.suppliers')
  return (
    <div className="space-y-6">
      <PageHeader showBack backHref="/scm/suppliers" title={t('detail.notFound')} />
      <DataBadge variant="neutral">{t('detail.notFound')}</DataBadge>
    </div>
  )
}
