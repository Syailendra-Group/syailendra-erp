'use client'

import { Edit2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { LinkButton } from '@/components/button/link-button'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'

import { AgriCard } from './agri-card'
import { NotesCard } from './notes-card'
import { ProfileCard } from './profile-card'
import { TerroirCard } from './terroir-card'

import type { FarmerRecord } from '@/types/scm/farmer'
import type { ReactElement } from 'react'

export interface FarmerDetailProps {
  farmer: FarmerRecord
}

export function FarmerDetail({ farmer }: FarmerDetailProps): ReactElement {
  const tTrace = useTranslations('scm.farmers')

  const mapsUrl = `https://maps.google.com/?q=${farmer.partner_latitude},${farmer.partner_longitude}`
  const landAreaHa = farmer.land_area_m2 ? (farmer.land_area_m2 / 10000).toFixed(2) : '0.25'
  const farmerCode = farmer.ref || String(farmer.id)

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        showBack={true}
        backHref="/scm/farmers"

        title={farmer.name}
        description={tTrace('detail.registeredSince')}
        titleBadge={
          <StatusBadge variant="neutral" className="font-mono text-xs">
            {farmer.ref}
          </StatusBadge>
        }
        statusBadge={
          <StatusBadge variant={farmer.active ? 'success' : 'destructive'} size="default">
            {farmer.active ? tTrace('status.activeVerified') : tTrace('status.archived')}
          </StatusBadge>
        }
        actions={<LinkButton href={`/scm/farmers/${farmerCode}/edit`} icon={Edit2} label={tTrace('detail.edit')} />}
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
