'use client'

import { Sprout } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { DetailRow } from '@/components/shared/detail-row'
import { SectionCard } from '@/components/shared/section-card'
import { Badge } from '@/components/ui/badge'

import type { ReactElement } from 'react'
import type { FarmerRecord } from '../actions'

export interface AgriCardProps {
  farmer: FarmerRecord
  landAreaHa: string
}

export function AgriCard({ farmer, landAreaHa }: AgriCardProps): ReactElement {
  const tTrace = useTranslations('traceability.farmers')

  return (
    <SectionCard title={tTrace('detail.agriTitle')} description={tTrace('sections.commodityDesc')} icon={Sprout} contentClassName="space-y-2.5">
      <DetailRow label={tTrace('fields.commodity')} value={tTrace(`commodities.${farmer.commodity}`)} valueClassName="font-semibold capitalize" />
      <DetailRow label={tTrace('fields.farmingMethod')} value={tTrace(`methods.${farmer.farming_method}`)} valueClassName="capitalize" />
      <DetailRow
        label={tTrace('fields.landArea')}
        value={`${farmer.land_area_m2?.toLocaleString()} m² (${landAreaHa} ${tTrace('detail.hectare')})`}
        mono={true}
      />
      <DetailRow label="Status" border={false}>
        <Badge variant="outline" className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          {tTrace('detail.verifiedPartner')}
        </Badge>
      </DetailRow>
    </SectionCard>
  )
}
