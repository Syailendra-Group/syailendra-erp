'use client'

import { Edit2, Navigation } from 'lucide-react'

import { LinkButton } from '@/components/button/link-button'
import { SectionCard } from '@/components/card/section-card'
import { DetailRow } from '@/components/shared/detail-row'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'

import type { VillageRecord } from '@/types/others/village'
import type { ReactElement } from 'react'

export interface VillageDetailProps {
  village: VillageRecord
}

export function VillageDetail({ village }: VillageDetailProps): ReactElement {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        showBack={true}
        backHref="/others/villages"
        backLabel="Kembali ke Daftar Desa"
        title={village.name}
        description="Rincian informasi desa lokasi budidaya petani"
        titleBadge={
          <StatusBadge variant="neutral" className="font-mono">
            {village.code || `VIL-${village.id}`}
          </StatusBadge>
        }
        statusBadge={<StatusBadge variant={village.active ? 'success' : 'neutral'}>{village.active ? 'Aktif' : 'Diarsipkan'}</StatusBadge>}
        actions={<LinkButton href={`/others/villages/${village.id}/edit`} icon={Edit2} label="Ubah Data" />}
      />

      <div className="max-w-xl">
        <SectionCard title="Informasi Kelurahan / Desa" description="Metadata desa dan posko kebun" icon={Navigation}>
          <div className="space-y-2 text-xs">
            <DetailRow label="Nama Desa" value={village.name} />
            <DetailRow label="Kode Wilayah" value={village.code || '-'} mono />
            <DetailRow label="Kode Pos" value={village.zip_code || '-'} mono />
            <DetailRow label="Kecamatan Induk" value={village.district_id ? village.district_id[1] : '-'} />
            <DetailRow label="Centroid GPS" value={village.latitude && village.longitude ? `${village.latitude}, ${village.longitude}` : '-'} mono />
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
