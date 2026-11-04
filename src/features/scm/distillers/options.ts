import { CheckCircle2, Clock, Droplets, Factory, Flame, ShieldCheck, Sparkles, Wind, Wrench } from 'lucide-react'

import type { SelectOption } from '@/components/form/select-form'

export function getDistillerOptions(tTrace: (key: string) => string) {
  const methodOptions: SelectOption[] = [
    { label: tTrace('methods.steam'), value: 'steam', description: 'Distilasi uap langsung (Direct Steam)', icon: Flame },
    { label: tTrace('methods.hydro'), value: 'hydro', description: 'Distilasi air mendidih (Water Distillation)', icon: Droplets },
    { label: tTrace('methods.water_steam'), value: 'water_steam', description: 'Kukus uap tak langsung (Water-Steam)', icon: Wind },
    { label: tTrace('methods.cold_pressed'), value: 'cold_pressed', description: 'Tekan dingin mekanis (Cold Press)', icon: Sparkles }
  ]

  const materialOptions: SelectOption[] = [
    { label: tTrace('materials.sus316'), value: 'sus316', description: 'Stainless Steel 316 Food & Pharma Grade', icon: ShieldCheck },
    { label: tTrace('materials.sus304'), value: 'sus304', description: 'Stainless Steel 304 Standard Industrial', icon: Factory },
    { label: tTrace('materials.copper'), value: 'copper', description: 'Tembaga Murni (Traditional Copper Alembic)', icon: Sparkles }
  ]

  const ownershipOptions: SelectOption[] = [
    { label: tTrace('ownership.internal'), value: 'internal', description: 'Unit milik penuh PT. Syailendra Bumi Investama', icon: Factory },
    { label: tTrace('ownership.partner'), value: 'partner', description: 'Unit suling mitra binaan tersertifikasi', icon: ShieldCheck }
  ]

  const sanitationOptions: SelectOption[] = [
    { label: tTrace('sanitation.passed'), value: 'passed', description: 'Lolos uji sanitasi & siap beroperasi', icon: CheckCircle2 },
    { label: tTrace('sanitation.pending'), value: 'pending', description: 'Menunggu audit sanitasi berkala', icon: Clock },
    { label: tTrace('sanitation.cleaning'), value: 'cleaning', description: 'Dalam proses CIP pembersihan & sterilisasi', icon: Wrench }
  ]

  return { methodOptions, materialOptions, ownershipOptions, sanitationOptions }
}
