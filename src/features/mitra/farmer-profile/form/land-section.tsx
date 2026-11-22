'use client'

import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { MitraCheckbox, MitraNumberInput, MitraSelect, MitraTextarea, MitraTextInput } from '@/components/form/mitra-fields'

const FARMING_SYSTEM_OPTIONS = [
  { value: 'conventional', label: 'Conventional' },
  { value: 'organic', label: 'Organic' },
  { value: 'agroforestry', label: 'Agroforestry' }
]

/**
 * FarmerLandSection — farm location, cultivation and land-history fields.
 * The controls rely on the surrounding react-hook-form context.
 */
export function FarmerLandSection() {
  const t = useTranslations('mitra.farmer')

  return (
    <SectionCard>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">{t('farmerProfile.sectionLand')}</h3>
        <p className="text-muted-foreground text-xs">{t('errors.zeroCoordinate')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <MitraTextInput name="farm_name" label={t('farmerProfile.labelFarmName')} placeholder={t('farmerProfile.placeholderFarmName')} />
          <MitraSelect
            name="farm_farming_system"
            label={t('farmerProfile.labelFarmingSystem')}
            placeholder={t('farmerProfile.placeholderFarmingSystem')}
            options={FARMING_SYSTEM_OPTIONS}
          />
          <MitraNumberInput name="farm_area_ha" label={t('farmerProfile.labelAreaHa')} placeholder={t('farmerProfile.placeholderAreaHa')} />
          <MitraNumberInput
            name="farm_elevation_mdpl"
            label={t('farmerProfile.labelElevationMdpl')}
            placeholder={t('farmerProfile.placeholderElevationMdpl')}
          />
          <MitraTextInput
            name="farm_google_maps_url"
            label={t('farmerProfile.labelGoogleMapsUrl')}
            placeholder={t('farmerProfile.placeholderGoogleMapsUrl')}
          />
          <MitraTextarea
            name="farm_pesticide_types"
            label={t('farmerProfile.labelPesticideTypes')}
            placeholder={t('farmerProfile.placeholderPesticideTypes')}
            rows={3}
          />
          <MitraCheckbox name="farm_uses_pesticide" label={t('farmerProfile.labelUsesPesticide')} />
          <MitraTextarea
            name="farm_herbicide_types"
            label={t('farmerProfile.labelHerbicideTypes')}
            placeholder={t('farmerProfile.placeholderHerbicideTypes')}
            rows={3}
          />
          <MitraCheckbox name="farm_uses_herbicide" label={t('farmerProfile.labelUsesHerbicide')} />
          <MitraTextInput
            name="farm_fertilizer_types"
            label={t('farmerProfile.labelFertilizerTypes')}
            placeholder={t('farmerProfile.placeholderFertilizerTypes')}
          />
          <MitraTextInput
            name="farm_water_source"
            label={t('farmerProfile.labelWaterSource')}
            placeholder={t('farmerProfile.placeholderWaterSource')}
          />
          <MitraTextarea
            name="farm_land_history"
            label={t('farmerProfile.labelLandHistory')}
            placeholder={t('farmerProfile.placeholderLandHistory')}
            rows={3}
          />
        </div>
      </div>
    </SectionCard>
  )
}
