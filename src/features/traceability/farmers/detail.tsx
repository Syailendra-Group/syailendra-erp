'use client'

import { ArrowLeft, Edit2, ExternalLink, MapPin, MessageSquare, ShieldCheck, Sprout, User } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
      {/* Top Navigation & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/traceability/farmers"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>{tTrace('detail.back')}</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{farmer.name}</h1>
            <Badge variant="outline" className="font-mono text-xs">
              {farmer.ref}
            </Badge>
            <Badge variant={farmer.active ? 'default' : 'secondary'} className="text-[11px]">
              {farmer.active ? tTrace('status.activeVerified') : tTrace('status.archived')}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">{tTrace('detail.registeredSince')}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="gap-2 font-semibold">
            <Link href={`/traceability/farmers/edit/${farmer.id}`}>
              <Edit2 className="size-3.5" />
              <span>{tTrace('detail.edit')}</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid Cards Details */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Card 1: Identity & Profile */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <User className="text-primary size-4" />
              <span>{tTrace('detail.profileTitle')}</span>
            </CardTitle>
            <CardDescription className="text-xs">{tTrace('sections.identityDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
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
            <div className="grid grid-cols-3">
              <span className="text-muted-foreground font-medium">{tTrace('fields.street')}</span>
              <span className="col-span-2">
                {farmer.street}, {farmer.city}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Agriculture & Commodity */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Sprout className="text-primary size-4" />
              <span>{tTrace('detail.agriTitle')}</span>
            </CardTitle>
            <CardDescription className="text-xs">{tTrace('sections.commodityDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
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
          </CardContent>
        </Card>

        {/* Card 3: Terroir & Geographic Coordinates */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="text-primary size-4" />
              <span>{tTrace('detail.terroirTitle')}</span>
            </CardTitle>
            <CardDescription className="text-xs">{tTrace('sections.terroirDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
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
              <Button variant="outline" size="sm" asChild className="gap-2 text-xs">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  <span>{tTrace('detail.openGmaps')}</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Agronomy Notes */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="text-primary size-4" />
              <span>{tTrace('detail.notesTitle')}</span>
            </CardTitle>
            <CardDescription className="text-xs">{tTrace('sections.notesDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="text-xs">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {(farmer.comment as string) || 'Belum ada catatan khusus agronomi lapangan untuk mitra ini.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
