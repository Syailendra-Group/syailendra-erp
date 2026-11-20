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
  const tCommon = useTranslations('common')

  const cardTitle = title || tCommon('address.sections.location')
  const cardDesc = description || tCommon('address.sections.locationDesc')

  return (
    <SectionCard title={cardTitle} description={cardDesc} icon={icon} className={className} contentClassName="space-y-2.5">
      <DetailRow label={tCommon('address.country')} value={countryName || 'Indonesia'} />
      <DetailRow label={tCommon('address.fields.province')} value={stateName || '-'} />
      <DetailRow label={tCommon('address.fields.regency')} value={cityName || '-'} />
      <DetailRow label={tCommon('address.fields.district')} value={districtName || '-'} />
      <DetailRow label={tCommon('address.fields.village')} value={villageName || '-'} />
      <DetailRow label={tCommon('address.zipCode')} value={zipCode || '-'} mono={true} />
      <DetailRow label={tCommon('address.fields.addressDetail')} value={addressDetail || '-'} />
      {/* Alamat Tambahan / Patokan SELALU tampil: ketika kosong maka "-" */}
      <DetailRow label={tCommon('address.benchmark')} value={benchmark || '-'} border={false} />
    </SectionCard>
  )
}
