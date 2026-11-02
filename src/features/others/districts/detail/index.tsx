'use client'

import { Edit2, MapPin } from 'lucide-react'

import { LinkButton } from '@/components/button/link-button'
import { SectionCard } from '@/components/card/section-card'
import { DetailRow } from '@/components/shared/detail-row'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'

import type { DistrictRecord } from '@/types/others/district'
import type { ReactElement } from 'react'

export interface DistrictDetailProps {
  district: DistrictRecord
}

export function DistrictDetail({ district }: DistrictDetailProps): ReactElement {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        showBack={true}
        backHref="/others/districts"
        backLabel="Kembali ke Daftar Kecamatan"
        title={district.name}
        description="Rincian informasi wilayah kecamatan"
        titleBadge={
          <StatusBadge variant="neutral" className="font-mono">
            {district.code || `DIST-${district.id}`}
          </StatusBadge>
        }
        statusBadge={<StatusBadge variant={district.active ? 'success' : 'neutral'}>{district.active ? 'Aktif' : 'Diarsipkan'}</StatusBadge>}
        actions={<LinkButton href={`/others/districts/${district.id}/edit`} icon={Edit2} label="Ubah Data" />}
      />

      <div className="max-w-xl">
        <SectionCard title="Informasi Kecamatan" description="Metadata terdaftar di Odoo 18" icon={MapPin}>
          <div className="space-y-2 text-xs">
            <DetailRow label="Nama Kecamatan" value={district.name} />
            <DetailRow label="Kode Wilayah" value={district.code || '-'} mono />
            <DetailRow label="Kabupaten / Kota" value={district.city_id ? district.city_id[1] : '-'} />
            <DetailRow label="Provinsi" value={district.state_id ? district.state_id[1] : '-'} />
            <DetailRow
              label="Centroid GPS"
              value={district.latitude && district.longitude ? `${district.latitude}, ${district.longitude}` : '-'}
              mono
            />
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
