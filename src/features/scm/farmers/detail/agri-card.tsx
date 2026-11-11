'use client'

import { Sprout } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { DetailRow } from '@/components/shared/detail-row'

import type { FarmerRecord } from '@/types/scm/farmer'
import type { ReactElement } from 'react'

export interface AgriCardProps {
  farmer: FarmerRecord
  landAreaHa: string
}

export function AgriCard({ farmer, landAreaHa }: AgriCardProps): ReactElement {
  const tTrace = useTranslations('scm.farmers')

  return (
    <SectionCard title={tTrace('detail.agriTitle')} description={tTrace('sections.commodityDesc')} icon={Sprout} contentClassName="space-y-2.5">
      <DetailRow
        label={tTrace('fields.commodity')}
        value={tTrace(`commodities.${farmer.commodity || 'gaharu'}`)}
        valueClassName="font-semibold capitalize"
      />
      <DetailRow label={tTrace('fields.farmingMethod')} value={tTrace(`methods.${farmer.farming_method || 'organic'}`)} valueClassName="capitalize" />
      <DetailRow
        label={tTrace('fields.landArea')}
        value={farmer.land_area_m2 ? `${farmer.land_area_m2.toLocaleString()} m² (${landAreaHa} ${tTrace('detail.hectare')})` : '-'}
        mono={true}
        border={false}
      />
    </SectionCard>
  )
}
