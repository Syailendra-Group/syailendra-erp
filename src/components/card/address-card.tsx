'use client'

import { type ComponentType, type ReactElement } from 'react'
import { MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { DetailRow } from '@/components/shared/detail-row'

export interface AddressCardProps {
  countryName?: string | false | null
  stateName?: string | false | null
  cityName?: string | false | null
  districtName?: string | false | null
  villageName?: string | false | null
  zipCode?: string | false | null
  addressDetail?: string | false | null
  benchmark?: string | false | null
  title?: string
  description?: string
  icon?: ComponentType<{ className?: string }>
  className?: string
}

export function AddressCard({
  countryName = 'Indonesia',
  stateName = '-',
  cityName = '-',
  districtName = '-',
  villageName = '-',
  zipCode = '-',
  addressDetail = '-',
  benchmark = '',
  title,
  description,
  icon = MapPin,
  className
}: AddressCardProps): ReactElement {
  const tTrace = useTranslations('scm.farmers')
  const tCommon = useTranslations('common')

  const cardTitle = title || tTrace('sections.location')
  const cardDesc = description || tTrace('sections.locationDesc')

  return (
    <SectionCard title={cardTitle} description={cardDesc} icon={icon} className={className} contentClassName="space-y-2.5">
      <DetailRow label={tCommon('address.country')} value={countryName || 'Indonesia'} />
      <DetailRow label={tTrace('fields.province')} value={stateName || '-'} />
      <DetailRow label={tTrace('fields.regency')} value={cityName || '-'} />
      <DetailRow label={tTrace('fields.district')} value={districtName || '-'} />
      <DetailRow label={tTrace('fields.village')} value={villageName || '-'} />
      <DetailRow label={tCommon('address.zipCode')} value={zipCode || '-'} mono={true} />
      <DetailRow label={tTrace('fields.addressDetail')} value={addressDetail || '-'} />
      {/* Alamat Tambahan / Patokan SELALU tampil: ketika kosong maka "-" */}
      <DetailRow label={tCommon('address.benchmark')} value={benchmark || '-'} border={false} />
    </SectionCard>
  )
}
