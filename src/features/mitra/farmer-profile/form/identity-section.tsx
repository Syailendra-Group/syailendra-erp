'use client'

import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { MitraNumberInput, MitraSelect, MitraTextInput } from '@/components/form/mitra-fields'

const LAND_OWNERSHIP_OPTIONS = [
  { value: 'owned', label: 'Owned' },
  { value: 'rented', label: 'Rented' },
  { value: 'shared', label: 'Shared' },
  { value: 'certified', label: 'Certified' }
]

/**
 * FarmerIdentitySection — farmer identity and land-tenure fields (W2 form 1).
 * The controls rely on the surrounding react-hook-form context.
 */
export function FarmerIdentitySection() {
  const t = useTranslations('mitra.farmer')

  return (
    <SectionCard>
      <div className="space-y-4">
        <h2 className="text-base font-semibold">{t('farmerProfile.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('farmerProfile.subtitle')}</p>

        <h3 className="text-sm font-semibold">{t('farmerProfile.sectionIdentity')}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <MitraTextInput name="nik" label={t('farmerProfile.labelNik')} placeholder={t('farmerProfile.placeholderNik')} required />
          <MitraTextInput name="name" label={t('farmerProfile.labelName')} placeholder={t('farmerProfile.placeholderName')} required />
          <MitraNumberInput
            name="land_area_m2"
            label={t('farmerProfile.labelLandAreaM2')}
            placeholder={t('farmerProfile.placeholderLandAreaM2')}
            required
          />
          <MitraNumberInput
            name="estimated_yield_kg"
            label={t('farmerProfile.labelEstimatedYieldKg')}
            placeholder={t('farmerProfile.placeholderEstimatedYieldKg')}
          />
          <MitraSelect
            name="land_ownership"
            label={t('farmerProfile.labelLandOwnership')}
            placeholder={t('farmerProfile.placeholderLandOwnership')}
            options={LAND_OWNERSHIP_OPTIONS}
          />
          <MitraTextInput
            name="planted_date"
            label={t('farmerProfile.labelPlantedDate')}
            placeholder={t('farmerProfile.placeholderPlantedDate')}
            type="date"
          />
        </div>
      </div>
    </SectionCard>
  )
}
