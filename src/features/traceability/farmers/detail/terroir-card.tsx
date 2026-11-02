'use client'

import { ExternalLink, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { DetailRow } from '@/components/shared/detail-row'
import { Button } from '@/components/ui/button'

import type { FarmerRecord } from '@/actions/traceability/farmer.action'
import type { ReactElement } from 'react'

export interface TerroirCardProps {
  farmer: FarmerRecord
  mapsUrl: string
}

export function TerroirCard({ farmer, mapsUrl }: TerroirCardProps): ReactElement {
  const tTrace = useTranslations('traceability.farmers')

  return (
    <SectionCard title={tTrace('detail.terroirTitle')} description={tTrace('sections.terroirDesc')} icon={MapPin} contentClassName="space-y-2.5">
      <DetailRow label="Latitude" value={farmer.partner_latitude} mono={true} />
      <DetailRow label="Longitude" value={farmer.partner_longitude} mono={true} />
      <DetailRow label="Wilayah" value={tTrace('detail.elevation')} />
      <div className="pt-1">
        <Button variant="outline" asChild className="gap-2 text-xs">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3.5" />
            <span>{tTrace('detail.openGmaps')}</span>
          </a>
        </Button>
      </div>
    </SectionCard>
  )
}
