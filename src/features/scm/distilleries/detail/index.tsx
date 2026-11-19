/**
 * index.tsx — Distillation Facility read-only detail orchestrator
 * Syailendra Group ERP — SCM Pillar
 */

'use client'

import { Edit2, Factory, Flame, MapPin, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { LinkButton } from '@/components/button/link-button'
import { SectionCard } from '@/components/card/section-card'
import { SummaryCardGrid } from '@/components/card/summary-card'
import { DataBadge } from '@/components/shared/data-badge'
import { DetailRow } from '@/components/shared/detail-row'
import { PageHeader } from '@/components/shared/page-header'

import type { SummaryCardItem } from '@/components/card/summary-card'
import type { DistilleryRecord } from '@/types/scm/distillery'
import type { ReactElement } from 'react'

export interface DistilleryDetailProps {
  distillery: DistilleryRecord
}

export function DistilleryDetail({ distillery }: DistilleryDetailProps): ReactElement {
  const t = useTranslations('scm.distilleries')
  const tCommon = useTranslations('common')

  const summaryItems: SummaryCardItem[] = [
    {
      title: t('details.summary.boilers'),
      value: String(distillery.boilerCount ?? 0),
      subtitle: distillery.boilerCapacityKg ? `${distillery.boilerCapacityKg} kg/batch` : '-',
      icon: Flame,
      color: 'text-amber-600'
    },
    {
      title: t('details.summary.avgYield'),
      value: distillery.avgYieldPercent != null ? `${distillery.avgYieldPercent}%` : '-',
      subtitle: t('details.summary.avgYieldSubtitle'),
      icon: Star,
      color: 'text-emerald-600'
    },
    {
      title: t('details.summary.monthlyCapacity'),
      value: distillery.monthlyCapacityKg != null ? `${distillery.monthlyCapacityKg} kg` : '-',
      subtitle: t('details.summary.monthlyCapacitySubtitle'),
      icon: Factory,
      color: 'text-primary'
    },
    {
      title: t('details.summary.leadTime'),
      value: distillery.leadTimeDays != null ? `${distillery.leadTimeDays} ${t('details.summary.days')}` : '-',
      subtitle: distillery.moqKg != null ? `MOQ ${distillery.moqKg} kg` : '-',
      icon: MapPin,
      color: 'text-blue-600'
    }
  ]

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        showBack
        backHref="/scm/distilleries"
        title={distillery.name}
        description={t('details.description')}
        titleBadge={
          <span className="border-primary/20 bg-primary/10 text-primary rounded border px-2 py-0.5 font-mono text-xs font-semibold">
            {distillery.code}
          </span>
        }
        actions={<LinkButton href={`/scm/distilleries/${distillery.id}/edit`} icon={Edit2} label={t('details.edit')} />}
      />

      <SummaryCardGrid items={summaryItems} />

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <SectionCard title={t('sections.identity')} description={t('sections.identityDesc')} icon={Factory}>
          <div className="grid grid-cols-1 gap-x-8 gap-y-0 md:grid-cols-2">
            <DetailRow label={t('details.labels.code')} value={distillery.code} mono />
            <DetailRow label={t('details.labels.partner')} value={distillery.partnerName || '-'} />
            <DetailRow
              label={t('details.labels.status')}
              value={
                <DataBadge variant={distillery.active ? 'success' : 'neutral'}>
                  {distillery.active ? tCommon('status.operational') : tCommon('status.maintenance')}
                </DataBadge>
              }
            />
            <DetailRow
              label={t('details.labels.facilityArea')}
              value={distillery.facilityAreaM2 != null ? `${distillery.facilityAreaM2} m²` : '-'}
              mono
            />
          </div>
        </SectionCard>

        <SectionCard title={t('sections.spec')} description={t('sections.specDesc')} icon={Flame}>
          <div className="grid grid-cols-1 gap-x-8 gap-y-0 md:grid-cols-2">
            <DetailRow label={t('details.labels.method')} value={t(`methods.${distillery.distillationMethod}`)} />
            <DetailRow label={t('details.labels.fuel')} value={t(`fuels.${distillery.fuelType}`)} />
            <DetailRow label={t('details.labels.boilerMaterial')} value={t(`materials.${distillery.boilerMaterial}`)} />
            <DetailRow label={t('details.labels.boilerCount')} value={String(distillery.boilerCount ?? '-')} mono />
            <DetailRow
              label={t('details.labels.boilerCapacity')}
              value={distillery.boilerCapacityKg != null ? `${distillery.boilerCapacityKg} kg` : '-'}
              mono
            />
          </div>
        </SectionCard>
      </div>

      <SectionCard title={t('sections.performance')} description={t('sections.performanceDesc')} icon={Star}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-0 md:grid-cols-2">
          <DetailRow
            label={t('details.labels.avgDuration')}
            value={distillery.avgDurationHours != null ? `${distillery.avgDurationHours} ${t('details.summary.hours')}` : '-'}
            mono
          />
          <DetailRow
            label={t('details.labels.operatingTemp')}
            value={distillery.operatingTempC != null ? `${distillery.operatingTempC} °C` : '-'}
            mono
          />
          <DetailRow
            label={t('details.labels.operatingPressure')}
            value={distillery.operatingPressureBar != null ? `${distillery.operatingPressureBar} bar` : '-'}
            mono
          />
          <DetailRow label={t('details.labels.avgYield')} value={distillery.avgYieldPercent != null ? `${distillery.avgYieldPercent}%` : '-'} mono />
          <DetailRow
            label={t('details.labels.yearlyCapacity')}
            value={distillery.yearlyCapacityKg != null ? `${distillery.yearlyCapacityKg} kg` : '-'}
            mono
          />
          <DetailRow label={t('details.labels.maxCapacity')} value={distillery.maxCapacityKg != null ? `${distillery.maxCapacityKg} kg` : '-'} mono />
        </div>
      </SectionCard>

      <SectionCard title={t('sections.location')} description={t('sections.locationDesc')} icon={MapPin}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-0 md:grid-cols-2">
          <DetailRow label={t('details.labels.address')} value={distillery.addressDetail || '-'} />
          <DetailRow label={t('details.labels.province')} value={distillery.stateName || '-'} />
          <DetailRow label={t('details.labels.city')} value={distillery.cityName || '-'} />
          <DetailRow label={t('details.labels.district')} value={distillery.districtName || '-'} />
          <DetailRow label={t('details.labels.subdistrict')} value={distillery.subdistrictName || '-'} />
          <DetailRow
            label={t('details.labels.coordinates')}
            value={distillery.latitude != null && distillery.longitude != null ? `${distillery.latitude}, ${distillery.longitude}` : '-'}
            mono
          />
        </div>
      </SectionCard>
    </div>
  )
}
