import { Boxes, Droplets, Factory, Flame, Leaf, ShieldCheck, Snowflake, Sparkles, Wind, Wrench, Zap } from 'lucide-react'

import type { SelectOption } from '@/components/form/select-form'

export function getDistilleryOptions(t: (key: string) => string) {
  const methodOptions: SelectOption[] = [
    { label: t('methods.steam'), value: 'steam', description: t('methodDescriptions.steam'), icon: Flame },
    { label: t('methods.water_dist'), value: 'water_dist', description: t('methodDescriptions.water_dist'), icon: Droplets },
    { label: t('methods.water_steam'), value: 'water_steam', description: t('methodDescriptions.water_steam'), icon: Wind },
    {
      label: t('methods.hydrodiffusion'),
      value: 'hydrodiffusion',
      description: t('methodDescriptions.hydrodiffusion'),
      icon: Sparkles
    },
    { label: t('methods.co2'), value: 'co2', description: t('methodDescriptions.co2'), icon: Snowflake },
    { label: t('methods.cold_press'), value: 'cold_press', description: t('methodDescriptions.cold_press'), icon: Leaf },
    { label: t('methods.solvent'), value: 'solvent', description: t('methodDescriptions.solvent'), icon: Boxes },
    { label: t('methods.enfleurage'), value: 'enfleurage', description: t('methodDescriptions.enfleurage'), icon: Sparkles }
  ]

  const materialOptions: SelectOption[] = [
    {
      label: t('materials.stainless_316'),
      value: 'stainless_316',
      description: t('materialDescriptions.stainless_316'),
      icon: ShieldCheck
    },
    {
      label: t('materials.stainless_304'),
      value: 'stainless_304',
      description: t('materialDescriptions.stainless_304'),
      icon: Factory
    },
    { label: t('materials.copper'), value: 'copper', description: t('materialDescriptions.copper'), icon: Sparkles },
    { label: t('materials.mild_steel'), value: 'mild_steel', description: t('materialDescriptions.mild_steel'), icon: Wrench },
    { label: t('materials.galvanized'), value: 'galvanized', description: t('materialDescriptions.galvanized'), icon: Boxes }
  ]

  const fuelOptions: SelectOption[] = [
    { label: t('fuels.firewood'), value: 'firewood', description: t('fuelDescriptions.firewood'), icon: Flame },
    { label: t('fuels.biomass'), value: 'biomass', description: t('fuelDescriptions.biomass'), icon: Leaf },
    { label: t('fuels.lpg'), value: 'lpg', description: t('fuelDescriptions.lpg'), icon: Zap },
    { label: t('fuels.solar'), value: 'solar', description: t('fuelDescriptions.solar'), icon: Droplets },
    { label: t('fuels.electric'), value: 'electric', description: t('fuelDescriptions.electric'), icon: Zap }
  ]

  return { methodOptions, materialOptions, fuelOptions }
}
