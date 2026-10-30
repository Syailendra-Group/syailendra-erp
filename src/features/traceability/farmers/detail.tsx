'use client'

import { Edit2, ExternalLink, MapPin, MessageSquare, ShieldCheck, Sprout, User } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { SectionCard } from '@/components/shared/section-card'
import { LongText } from '@/components/text/long-text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

import type { ReactElement } from 'react'
import type { FarmerRecord } from './actions'

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
        <SectionCard
          title={tTrace('detail.profileTitle')}
          description={tTrace('sections.identityDesc')}
          icon={User}
          contentClassName="space-y-3 text-xs"
        >
          <div className="border-border/40 grid grid-cols-3 border-b pb-2">
            <span className="text-muted-foreground font-medium">{tTrace('fields.ref')}</span>
            <span className="col-span-2 font-mono font-semibold">{farmer.ref}</span>
          </div>
          <div className="border-border/40 grid grid-cols-3 border-b pb-2">
            <span className="text-muted-foreground font-medium">{tTrace('fields.name')}</span>
            <span className="col-span-2 font-semibold">{farmer.name}</span>
          </div>
          <div className="border-border/40 grid grid-cols-3 border-b pb-2">
            <span className="text-muted-foreground font-medium">{tTrace('fields.vat')}</span>
            <span className="col-span-2 font-mono">{farmer.vat || '-'}</span>
          </div>
          <div className="border-border/40 grid grid-cols-3 border-b pb-2">
            <span className="text-muted-foreground font-medium">{tTrace('fields.phone')}</span>
            <div className="col-span-2 flex items-center gap-2">
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
          </div>
          <div className="grid grid-cols-3 items-center">
            <span className="text-muted-foreground font-medium">{tTrace('fields.street')}</span>
            <div className="col-span-2">
              <LongText>
                {farmer.street}, {farmer.city}
              </LongText>
            </div>
          </div>
        </SectionCard>

        {/* Card 2: Agriculture & Commodity */}
        <SectionCard
          title={tTrace('detail.agriTitle')}
          description={tTrace('sections.commodityDesc')}
          icon={Sprout}
          contentClassName="space-y-3 text-xs"
        >
          <div className="border-border/40 grid grid-cols-3 border-b pb-2">
            <span className="text-muted-foreground font-medium">{tTrace('fields.commodity')}</span>
            <span className="col-span-2 font-semibold capitalize">{tTrace(`commodities.${farmer.commodity}`)}</span>
          </div>
          <div className="border-border/40 grid grid-cols-3 border-b pb-2">
            <span className="text-muted-foreground font-medium">{tTrace('fields.farmingMethod')}</span>
            <span className="col-span-2 capitalize">{tTrace(`methods.${farmer.farming_method}`)}</span>
          </div>
          <div className="border-border/40 grid grid-cols-3 border-b pb-2">
            <span className="text-muted-foreground font-medium">{tTrace('fields.landArea')}</span>
            <span className="col-span-2 font-mono font-semibold">
              {farmer.land_area_m2?.toLocaleString()} m² ({landAreaHa} {tTrace('detail.hectare')})
            </span>
          </div>
          <div className="grid grid-cols-3">
            <span className="text-muted-foreground font-medium">Status</span>
            <div className="col-span-2">
              <Badge variant="outline" className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                {tTrace('detail.verifiedPartner')}
              </Badge>
            </div>
          </div>
        </SectionCard>

        {/* Card 3: Terroir & Geographic Coordinates */}
        <SectionCard
          title={tTrace('detail.terroirTitle')}
          description={tTrace('sections.terroirDesc')}
          icon={MapPin}
          contentClassName="space-y-3 text-xs"
        >
          <div className="border-border/40 grid grid-cols-3 border-b pb-2">
            <span className="text-muted-foreground font-medium">Latitude</span>
            <span className="col-span-2 font-mono font-semibold">{farmer.partner_latitude}</span>
          </div>
          <div className="border-border/40 grid grid-cols-3 border-b pb-2">
            <span className="text-muted-foreground font-medium">Longitude</span>
            <span className="col-span-2 font-mono font-semibold">{farmer.partner_longitude}</span>
          </div>
          <div className="border-border/40 grid grid-cols-3 border-b pb-2">
            <span className="text-muted-foreground font-medium">Wilayah</span>
            <span className="col-span-2 font-medium">{tTrace('detail.elevation')}</span>
          </div>
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
