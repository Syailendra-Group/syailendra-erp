import { Coffee, ShieldCheck, Sparkles, Sprout, Trees, Wheat } from 'lucide-react'

import type { SelectOption } from '@/components/form/select-form'

export function getCommodityOptions(tTrace: (key: string) => string): SelectOption[] {
  return [
    {
      label: tTrace('commodities.gaharu'),
      value: 'gaharu',
      description: 'Aquilaria malaccensis — resin gaharu gubal Dieng',
      icon: Sparkles
    },
    {
      label: tTrace('commodities.nilam'),
      value: 'nilam',
      description: 'Pogostemon cablin — daun nilam atsiri patchouli',
      icon: Sprout
    },
    {
      label: tTrace('commodities.serai'),
      value: 'serai',
      description: 'Cymbopogon winterianus — serai wangi Jawa',
      icon: Wheat
    },
    {
      label: tTrace('commodities.kopi'),
      value: 'kopi',
      description: 'Coffea arabica / robusta terroir Dieng',
      icon: Coffee
    },
    {
      label: tTrace('commodities.cengkeh'),
      value: 'cengkeh',
      description: 'Syzygium aromaticum — daun dan bunga cengkeh',
      icon: Trees
    }
  ]
}

export function getFarmingMethodOptions(tTrace: (key: string) => string): SelectOption[] {
  return [
    {
      label: tTrace('methods.organic'),
      value: 'organic',
      description: 'Budidaya hayati bebas pupuk/pestisida kimia sintetis',
      icon: Sprout
    },
    {
      label: tTrace('methods.conventional'),
      value: 'conventional',
      description: 'Praktik pertanian terkontrol pendampingan agronomi',
      icon: ShieldCheck
    }
  ]
}
