'use client'

import { type ReactElement } from 'react'
import { FileCheck2, HeartHandshake, Leaf, Recycle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SummaryCardGrid } from '@/components/card/summary-card'
import { QuickActions } from '@/components/shared/quick-actions'
import { Badge } from '@/components/ui/badge'

import type { SummaryCardItem } from '@/components/card/summary-card'
import type { QuickActionItem } from '@/components/shared/quick-actions'

export function ImmOverview(): ReactElement {
  const t = useTranslations('imm.overview')
  const tCommon = useTranslations('common')

  const kpis: SummaryCardItem[] = [
    { title: 'Ekonomi Sirkular', value: '98.5% Daur', subtitle: 'Zero Waste Limbah Suling Atsiri', icon: Recycle, color: 'text-emerald-500' },
    { title: 'Beasiswa Kehidupan', value: '45 Anak', subtitle: 'Pendidikan Keluarga Petani Mitra', icon: HeartHandshake, color: 'text-primary' },
    { title: 'Lahan Kritis Pulih', value: '12.4 Ha', subtitle: 'Konservasi Lereng Sindoro', icon: Leaf, color: 'text-green-600' },
    { title: 'Kepatuhan SDGs', value: '6 Sasaran', subtitle: 'SDG 1, 8, 12, 13, 15, 17', icon: FileCheck2, color: 'text-amber-500' }
  ]

  const shortcuts: QuickActionItem[] = [
    { label: 'Dossier Ekonomi Sirkular & Kompos', href: '/imm', icon: Recycle },
    { label: 'Penerima Beasiswa Kehidupan', href: '/imm', icon: HeartHandshake },
    { label: 'Peta Plot Lahan Rehabilitasi', href: '/imm', icon: Leaf },
    { label: 'Matriks Kepatuhan SDGs PBB', href: '/imm', icon: FileCheck2 }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="bg-primary/10 text-primary rounded-lg p-2">
            <Leaf className="size-4 sm:size-5" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">{t('title')}</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">{t('subtitle')}</p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-[11px] sm:text-xs">
          <FileCheck2 className="mr-1 size-3 sm:size-3.5" /> {t('immBadge')}
        </Badge>
      </div>

      <SummaryCardGrid items={kpis} />

      <QuickActions items={shortcuts} title={tCommon('quickActions.title')} />
    </div>
  )
}
