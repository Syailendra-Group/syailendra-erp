'use client'

import { Edit2, Landmark } from 'lucide-react'

import { LinkButton } from '@/components/button/link-button'
import { SectionCard } from '@/components/card/section-card'
import { DetailRow } from '@/components/shared/detail-row'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'

import type { ProvinceRecord } from '@/types/others/province'
import type { ReactElement } from 'react'

export interface ProvinceDetailProps {
  province: ProvinceRecord
}

export function ProvinceDetail({ province }: ProvinceDetailProps): ReactElement {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        showBack={true}
        backHref="/others/provinces"
        backLabel="Kembali ke Daftar Provinsi"
        title={province.name}
        description="Rincian informasi wilayah provinsi / state"
        titleBadge={
          <StatusBadge variant="neutral" className="font-mono">
            {province.code}
          </StatusBadge>
        }
        actions={<LinkButton href={`/others/provinces/${province.id}/edit`} icon={Edit2} label="Ubah Data" />}
      />

      <div className="max-w-xl">
        <SectionCard title="Informasi Wilayah" description="Metadata terdaftar di Odoo 18" icon={Landmark}>
          <div className="space-y-2 text-xs">
            <DetailRow label="Nama Provinsi" value={province.name} />
            <DetailRow label="Kode Wilayah" value={province.code} mono />
            <DetailRow label="Negara Induk" value={province.country_id ? province.country_id[1] : 'Indonesia'} />
            <DetailRow label="Database Odoo ID" value={`#${province.id}`} mono />
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
