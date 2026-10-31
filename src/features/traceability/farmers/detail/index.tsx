'use client'

import { Edit2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

import { AgriCard } from './agri-card'
import { NotesCard } from './notes-card'
import { ProfileCard } from './profile-card'
import { TerroirCard } from './terroir-card'

import type { ReactElement } from 'react'
import type { FarmerRecord } from '../actions'

export interface FarmerDetailProps {
  farmer: FarmerRecord
}

export function FarmerDetail({ farmer }: FarmerDetailProps): ReactElement {
  const tTrace = useTranslations('traceability.farmers')

  const mapsUrl = `https://maps.google.com/?q=${farmer.partner_latitude},${farmer.partner_longitude}`
  const landAreaHa = farmer.land_area_m2 ? (farmer.land_area_m2 / 10000).toFixed(2) : '0.25'
  const farmerCode = farmer.ref || String(farmer.id)

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
            <Link href={`/traceability/farmers/${farmerCode}/edit`}>
              <Edit2 className="size-4" />
              <span>{tTrace('detail.edit')}</span>
            </Link>
          </Button>
        }
      />

      {/* Grid Cards Details */}
      <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2">
        <ProfileCard farmer={farmer} />
        <AgriCard farmer={farmer} landAreaHa={landAreaHa} />
        <TerroirCard farmer={farmer} mapsUrl={mapsUrl} />
        <NotesCard farmer={farmer} />
      </div>
    </div>
  )
}
