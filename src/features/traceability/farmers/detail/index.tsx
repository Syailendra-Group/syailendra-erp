'use client'

import { Edit2, ExternalLink, MapPin, MessageSquare, ShieldCheck, Sprout, User } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { DetailRow } from '@/components/shared/detail-row'
import { PageHeader } from '@/components/shared/page-header'
import { SectionCard } from '@/components/shared/section-card'
import { LongText } from '@/components/text/long-text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

import type { ReactElement } from 'react'
import type { FarmerRecord } from '../actions'

export interface FarmerDetailProps {
  farmer: FarmerRecord
}

export function FarmerDetail({ farmer }: FarmerDetailProps): ReactElement {
  const tTrace = useTranslations('traceability.farmers')

  const phoneStr = (farmer.phone as string) || ''
  const cleanPhone = phoneStr.replace(/[^0-9]/g, '')
  const waUrl = cleanPhone.startsWith('0') ? `https://wa.me/62${cleanPhone.slice(1)}` : `https://wa.me/${cleanPhone}`
  const mapsUrl = `https://maps.google.com/?q=${farmer.partner_latitude},${farmer.partner_longitude}`
  const landAreaHa = farmer.land_area_m2 ? (farmer.land_area_m2 / 10000).toFixed(2) : '0.25'

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        showBack={true}
        backHref="/traceability/farmers"
        backLabel={tTrace('detail.back')}
        title={farmer.name}
        description={tTrace('detail.registeredSince')}
        titleBadge={
          <Badge variant="outline" className="font-mono text-xs">
            {farmer.ref}
          </Badge>
        }
        statusBadge={
          <Badge variant={farmer.active ? 'default' : 'secondary'} className="text-[11px]">
            {farmer.active ? tTrace('status.activeVerified') : tTrace('status.archived')}
          </Badge>
        }
        actions={
          <Button asChild className="gap-2 font-semibold">
            <Link href={`/traceability/farmers/edit/${farmer.id}`}>
              <Edit2 className="size-4" />
              <span>{tTrace('detail.edit')}</span>
            </Link>
          </Button>
        }
      />

      {/* Grid Cards Details */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Card 1: Identity & Profile */}
        <SectionCard title={tTrace('detail.profileTitle')} description={tTrace('sections.identityDesc')} icon={User} contentClassName="space-y-2.5">
          <DetailRow label={tTrace('fields.ref')} value={farmer.ref} mono={true} />
          <DetailRow label={tTrace('fields.name')} value={farmer.name} valueClassName="font-semibold" />
          <DetailRow label={tTrace('fields.vat')} value={farmer.vat || '-'} mono={true} />
          <DetailRow label={tTrace('fields.phone')}>
            <div className="flex items-center gap-2">
              <span className="font-mono">{farmer.phone || '-'}</span>
              {phoneStr && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-1 font-medium underline"
                >
                  <MessageSquare className="size-3" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </DetailRow>
          <DetailRow label={tTrace('fields.street')} border={false}>
            <LongText>
              {farmer.street}, {farmer.city}
            </LongText>
          </DetailRow>
        </SectionCard>

        {/* Card 2: Agriculture & Commodity */}
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

        {/* Card 3: Terroir & Geographic Coordinates */}
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

        {/* Card 4: Agronomy Notes */}
        <SectionCard title={tTrace('detail.notesTitle')} description={tTrace('sections.notesDesc')} icon={ShieldCheck} contentClassName="text-sm">
          <LongText contentClassName="text-xs max-w-sm">
            {(farmer.comment as string) || 'Belum ada catatan khusus agronomi lapangan untuk mitra ini.'}
          </LongText>
        </SectionCard>
      </div>
    </div>
  )
}
