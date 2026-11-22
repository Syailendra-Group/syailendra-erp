'use client'

import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { PhotoCapture } from '@/features/mitra/photo-capture'

type FarmerEvidenceSectionProps = {
  photoFile: File | null
  onPhotoChange: (file: File | null) => void
  disabled?: boolean
}

/**
 * FarmerEvidenceSection — farm photo capture for the farmer-profile form.
 */
export function FarmerEvidenceSection({ photoFile, onPhotoChange, disabled = false }: FarmerEvidenceSectionProps) {
  const t = useTranslations('mitra.farmer')

  return (
    <SectionCard>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">{t('farmerProfile.labelFarmPhoto')}</h3>
        <PhotoCapture onChange={onPhotoChange} value={photoFile} disabled={disabled} />
      </div>
    </SectionCard>
  )
}
