/**
 * index.tsx — Farm block read-only detail orchestrator
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { Edit2, MapPin, Sprout, Trees, Warehouse } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { LinkButton } from '@/components/button/link-button'
import { AddressCard } from '@/components/card/address-card'
import { SectionCard } from '@/components/card/section-card'
import { SummaryCardGrid } from '@/components/card/summary-card'
import { MediaGallery } from '@/components/image/media-gallery'
import { LocationMapCard } from '@/components/map/location-map-card'
import { DataBadge } from '@/components/shared/data-badge'
import { DetailRow } from '@/components/shared/detail-row'
import { PageHeader } from '@/components/shared/page-header'

import type { SummaryCardItem } from '@/components/card/summary-card'
import type { FarmRecord } from '@/types/scm/farm'
import type { ReactElement } from 'react'

export interface FarmDetailProps {
  farm: FarmRecord
}

export function FarmDetail({ farm }: FarmDetailProps): ReactElement {
  const t = useTranslations('scm.farms')

  const summaryItems: SummaryCardItem[] = [
    {
      title: t('details.summary.area'),
      value: farm.areaHa != null ? `${farm.areaHa} ha` : '-',
      subtitle: farm.elevationMdpl != null ? `${farm.elevationMdpl} ${t('details.summary.mdpl')}` : '-',
      icon: MapPin,
      color: 'text-primary'
    },
    {
      title: t('details.summary.farmingSystem'),
      value: t(`farmingSystems.${farm.farmingSystem}`),
      subtitle: t('details.summary.farmingSystemSubtitle'),
      icon: Sprout,
      color: 'text-emerald-600'
    },
    {
      title: t('details.summary.owner'),
      value: farm.partnerName || t('details.summary.unassigned'),
      subtitle: t('details.summary.ownerSubtitle'),
      icon: Warehouse,
      color: 'text-amber-600'
    },
    {
      title: t('details.summary.crops'),
      value: String(farm.cropIds.length),
      subtitle: t('details.summary.cropsSubtitle'),
      icon: Trees,
      color: 'text-blue-600'
    }
  ]

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        showBack
        backHref="/scm/farms"
        title={farm.name}
        description={t('details.description')}
        titleBadge={
          <span className="border-primary/20 bg-primary/10 text-primary rounded border px-2 py-0.5 font-mono text-xs font-semibold">{farm.code}</span>
        }
        actions={<LinkButton href={`/scm/farms/${farm.id}/edit`} icon={Edit2} label={t('details.edit')} />}
      />

      <SummaryCardGrid items={summaryItems} />

      <SectionCard title={t('sections.identity')} description={t('sections.identityDesc')} icon={Sprout}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-0 md:grid-cols-2">
          <DetailRow label={t('details.labels.code')} value={farm.code} mono />
          <DetailRow label={t('details.labels.owner')} value={farm.partnerName || '-'} />
          <DetailRow
            label={t('details.labels.status')}
            value={
              <DataBadge variant={farm.active ? 'success' : 'neutral'}>
                {farm.active ? t('details.values.active') : t('details.values.archived')}
              </DataBadge>
            }
          />
          <DetailRow label={t('details.labels.maps')} value={farm.googleMapsUrl || '-'} />
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <AddressCard
          title={t('details.sections.address')}
          description={t('details.sections.addressDesc')}
          countryName="Indonesia"
          stateName={farm.stateName}
          cityName={farm.cityName}
          districtName={farm.districtName}
          villageName={farm.subdistrictName}
          addressDetail={farm.addressDetail}
        />
        <LocationMapCard
          latitude={farm.latitude ?? undefined}
          longitude={farm.longitude ?? undefined}
          title={farm.name}
          description={farm.cityName || farm.stateName || undefined}
          markerLabel={farm.name}
          markerPopup={farm.addressDetail || undefined}
        />
      </div>

      <MediaGallery
        model="syailendra.farm"
        recordId={farm.id}
        role="gallery"
        readOnly
        legacyImageUrl={`/api/odoo/image/syailendra.farm/${farm.id}/photo_farm?size=512`}
      />

      <SectionCard title={t('sections.cultivation')} description={t('sections.cultivationDesc')} icon={Sprout}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-0 md:grid-cols-2">
          <DetailRow
            label={t('details.labels.pesticide')}
            value={farm.usesPesticide ? `${t('details.values.yes')} - ${farm.pesticideTypes || '-'}` : t('details.values.no')}
          />
          <DetailRow
            label={t('details.labels.herbicide')}
            value={farm.usesHerbicide ? `${t('details.values.yes')} - ${farm.herbicideTypes || '-'}` : t('details.values.no')}
          />
          <DetailRow label={t('details.labels.fertilizer')} value={farm.fertilizerTypes || '-'} />
          <DetailRow label={t('details.labels.waterSource')} value={farm.waterSource || '-'} />
        </div>
      </SectionCard>

      <SectionCard title={t('sections.sustainability')} description={t('sections.sustainabilityDesc')} icon={Trees}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-0 md:grid-cols-2">
          <DetailRow label={t('details.labels.landHistory')} value={farm.landHistory || '-'} />
        </div>
      </SectionCard>
    </div>
  )
}
