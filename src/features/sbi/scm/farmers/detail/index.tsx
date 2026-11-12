'use client'

import { Edit2, MapPin, Maximize2, Shield, Sprout } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { LinkButton } from '@/components/button/link-button'
import { AddressCard } from '@/components/card/address-card'
import { SummaryCardGrid } from '@/components/card/summary-card'
import { LocationMapCard } from '@/components/map/location-map-card'
import { PageHeader } from '@/components/shared/page-header'

import { AgriCard } from './agri-card'
import { NotesCard } from './notes-card'
import { ProfileCard } from './profile-card'

import type { SummaryCardItem } from '@/components/card/summary-card'
import type { FarmerRecord } from '@/types/sbi/scm/farmer'
import type { ReactElement } from 'react'

export interface FarmerDetailProps {
  farmer: FarmerRecord
}

export function FarmerDetail({ farmer }: FarmerDetailProps): ReactElement {
  const tTrace = useTranslations('scm.farmers')

  const landAreaHa = farmer.land_area_m2 ? (farmer.land_area_m2 / 10000).toFixed(2) : '0.25'
  const commKey = farmer.commodity || 'gaharu'
  const methodKey = farmer.farming_method || 'organic'
  const cityName = farmer.city_id && Array.isArray(farmer.city_id) ? farmer.city_id[1] : farmer.city || '-'

  const metricItems: SummaryCardItem[] = [
    {
      title: tTrace('fields.landArea'),
      value: farmer.land_area_m2 ? `${farmer.land_area_m2.toLocaleString()} m²` : '-',
      subtitle: `${landAreaHa} ${tTrace('detail.hectare')}`,
      icon: Maximize2,
      color: 'text-emerald-600'
    },
    {
      title: tTrace('fields.commodity'),
      value: tTrace(`commodities.${commKey}`),
      subtitle: tTrace('detail.mainCommoditySubtitle'),
      icon: Sprout,
      color: 'text-primary'
    },
    {
      title: tTrace('fields.farmingMethod'),
      value: tTrace(`methods.${methodKey}`),
      subtitle: tTrace('detail.farmingStandardSubtitle'),
      icon: Shield,
      color: 'text-amber-600'
    },
    {
      title: tTrace('fields.city'),
      value: cityName,
      subtitle: farmer.state_id && Array.isArray(farmer.state_id) ? farmer.state_id[1] : tTrace('detail.domicileSubtitle'),
      icon: MapPin,
      color: 'text-blue-600'
    }
  ]

  const countryName = farmer.country_id && Array.isArray(farmer.country_id) ? farmer.country_id[1] : 'Indonesia'
  const stateName = farmer.state_id && Array.isArray(farmer.state_id) ? farmer.state_id[1] : '-'
  const districtName = farmer.district_id && Array.isArray(farmer.district_id) ? farmer.district_id[1] : '-'
  const villageName = farmer.subdistrict_id && Array.isArray(farmer.subdistrict_id) ? farmer.subdistrict_id[1] : farmer.street || '-'

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        showBack={true}
        backHref="/scm/farmers"
        title={farmer.name}
        description={tTrace('detail.registeredSince')}
        titleBadge={
          <span className="border-primary/20 bg-primary/10 text-primary rounded border px-2 py-0.5 font-mono text-xs font-semibold">
            {farmer.ref}
          </span>
        }
        actions={<LinkButton href={`/scm/farmers/${farmer.id}/edit`} icon={Edit2} label={tTrace('detail.edit')} />}
      />

      {/* Top Hero Metric Cards */}
      <SummaryCardGrid items={metricItems} />

      {/* 2-Column Responsive Detail Layout */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <ProfileCard farmer={farmer} />
          <AgriCard farmer={farmer} landAreaHa={landAreaHa} />
          <NotesCard farmer={farmer} />
        </div>

        <div className="space-y-5">
          <AddressCard
            countryName={countryName}
            stateName={stateName}
            cityName={cityName}
            districtName={districtName}
            villageName={villageName}
            zipCode={farmer.zip_code}
            addressDetail={farmer.address_detail || farmer.street}
            benchmark={farmer.address_benchmark}
          />
          <LocationMapCard
            latitude={farmer.partner_latitude}
            longitude={farmer.partner_longitude}
            title={tTrace('detail.terroirTitle')}
            description={tTrace('sections.terroirDesc')}
            markerLabel={farmer.name}
            markerPopup={`<b>${farmer.name}</b><br/>${farmer.ref}<br/>${tTrace(`commodities.${commKey}`)}`}
            height="h-80"
          />
        </div>
      </div>
    </div>
  )
}
