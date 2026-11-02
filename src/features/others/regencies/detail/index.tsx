'use client'

import { Building2, Edit2 } from 'lucide-react'

import { LinkButton } from '@/components/button/link-button'
import { SectionCard } from '@/components/card/section-card'
import { DetailRow } from '@/components/shared/detail-row'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'

import type { RegencyRecord } from '@/types/others/regency'
import type { ReactElement } from 'react'

export interface RegencyDetailProps {
  regency: RegencyRecord
}

export function RegencyDetail({ regency }: RegencyDetailProps): ReactElement {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        showBack={true}
        backHref="/others/regencies"
        backLabel="Kembali ke Daftar Kab/Kota"
        title={regency.name}
        description="Rincian informasi wilayah administratif kabupaten / kota"
        titleBadge={
          <StatusBadge variant="neutral" className="font-mono">
            {regency.code || `ID-${regency.id}`}
          </StatusBadge>
        }
        statusBadge={<StatusBadge variant={regency.active ? 'success' : 'neutral'}>{regency.active ? 'Aktif' : 'Diarsipkan'}</StatusBadge>}
        actions={<LinkButton href={`/others/regencies/${regency.id}/edit`} icon={Edit2} label="Ubah Data" />}
      />

      <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2">
        <SectionCard title="Identitas Wilayah" description="Informasi yurisdiksi" icon={Building2}>
          <div className="space-y-2 text-xs">
            <DetailRow label="Nama Wilayah" value={regency.name} />
            <DetailRow label="Kode BPS" value={regency.code || '-'} mono />
            <DetailRow label="Nama Alias" value={regency.alias || '-'} />
            <DetailRow label="Provinsi Induk" value={regency.state_id ? regency.state_id[1] : '-'} />
            <DetailRow label="Negara" value={regency.country_id ? regency.country_id[1] : 'Indonesia'} />
          </div>
        </SectionCard>

        <SectionCard title="Koordinat & Deskripsi" description="Data spasial centroid" icon={Building2}>
          <div className="space-y-2 text-xs">
            <DetailRow label="Centroid Lintang" value={regency.latitude ? String(regency.latitude) : '-'} mono />
            <DetailRow label="Centroid Bujur" value={regency.longitude ? String(regency.longitude) : '-'} mono />
            <DetailRow label="Keterangan" value={regency.description || 'Sentra perkebunan & penyulingan'} />
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
