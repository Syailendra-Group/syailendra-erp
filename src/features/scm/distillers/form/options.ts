import { CheckCircle2, Clock, Droplets, Factory, Flame, ShieldCheck, Sparkles, Wind, Wrench } from 'lucide-react'

import type { SelectOption } from '@/components/form/select-form'

export function getDistillerOptions(tTrace: (key: string) => string) {
  const methodOptions: SelectOption[] = [
    { label: tTrace('methods.steam'), value: 'steam', description: tTrace('methodDescriptions.steam'), icon: Flame },
    { label: tTrace('methods.hydro'), value: 'hydro', description: tTrace('methodDescriptions.hydro'), icon: Droplets },
    { label: tTrace('methods.water_steam'), value: 'water_steam', description: tTrace('methodDescriptions.water_steam'), icon: Wind },
    { label: tTrace('methods.cold_pressed'), value: 'cold_pressed', description: tTrace('methodDescriptions.cold_pressed'), icon: Sparkles }
  ]

  const materialOptions: SelectOption[] = [
    { label: tTrace('materials.sus316'), value: 'sus316', description: tTrace('materialDescriptions.sus316'), icon: ShieldCheck },
    { label: tTrace('materials.sus304'), value: 'sus304', description: tTrace('materialDescriptions.sus304'), icon: Factory },
    { label: tTrace('materials.copper'), value: 'copper', description: tTrace('materialDescriptions.copper'), icon: Sparkles }
  ]

  const ownershipOptions: SelectOption[] = [
    { label: tTrace('ownership.internal'), value: 'internal', description: tTrace('ownershipDescriptions.internal'), icon: Factory },
    { label: tTrace('ownership.partner'), value: 'partner', description: tTrace('ownershipDescriptions.partner'), icon: ShieldCheck }
  ]

  const sanitationOptions: SelectOption[] = [
    { label: tTrace('sanitation.passed'), value: 'passed', description: tTrace('sanitationDescriptions.passed'), icon: CheckCircle2 },
    { label: tTrace('sanitation.pending'), value: 'pending', description: tTrace('sanitationDescriptions.pending'), icon: Clock },
    { label: tTrace('sanitation.cleaning'), value: 'cleaning', description: tTrace('sanitationDescriptions.cleaning'), icon: Wrench }
  ]

  return { methodOptions, materialOptions, ownershipOptions, sanitationOptions }
}
