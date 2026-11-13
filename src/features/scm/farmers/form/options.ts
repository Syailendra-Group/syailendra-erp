import { Coffee, ShieldCheck, Sparkles, Sprout, Trees, Wheat } from 'lucide-react'

import type { SelectOption } from '@/components/form/select-form'

export function getCommodityOptions(tTrace: (key: string) => string): SelectOption[] {
  return [
    {
      label: tTrace('commodities.gaharu'),
      value: 'gaharu',
      description: tTrace('commodityDescriptions.gaharu'),
      icon: Sparkles
    },
    {
      label: tTrace('commodities.nilam'),
      value: 'nilam',
      description: tTrace('commodityDescriptions.nilam'),
      icon: Sprout
    },
    {
      label: tTrace('commodities.serai'),
      value: 'serai',
      description: tTrace('commodityDescriptions.serai'),
      icon: Wheat
    },
    {
      label: tTrace('commodities.kopi'),
      value: 'kopi',
      description: tTrace('commodityDescriptions.kopi'),
      icon: Coffee
    },
    {
      label: tTrace('commodities.cengkeh'),
      value: 'cengkeh',
      description: tTrace('commodityDescriptions.cengkeh'),
      icon: Trees
    }
  ]
}

export function getFarmingMethodOptions(tTrace: (key: string) => string): SelectOption[] {
  return [
    {
      label: tTrace('methods.organic'),
      value: 'organic',
      description: tTrace('methodDescriptions.organic'),
      icon: Sprout
    },
    {
      label: tTrace('methods.conventional'),
      value: 'conventional',
      description: tTrace('methodDescriptions.conventional'),
      icon: ShieldCheck
    }
  ]
}
