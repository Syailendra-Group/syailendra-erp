'use client'

import { type ReactElement } from 'react'
import { Building2, Calculator, Coins, Scale, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SummaryCardGrid } from '@/components/card/summary-card'
import { QuickActions } from '@/components/shared/quick-actions'
import { Badge } from '@/components/ui/badge'

import type { SummaryCardItem } from '@/components/card/summary-card'
import type { QuickActionItem } from '@/components/shared/quick-actions'

export function FtmOverview(): ReactElement {
  const t = useTranslations('ftm.overview')
  const tCommon = useTranslations('common')

  const kpis: SummaryCardItem[] = [
    { title: 'Total Kas Holding', value: 'Rp 4.2 M', subtitle: 'Konsolidasi 4 Entitas', icon: Coins, color: 'text-primary' },
    { title: 'Faktur Pajak PPh/PPN', value: '100% Taat', subtitle: 'Kepatuhan Fiskal DJP', icon: Scale, color: 'text-emerald-500' },
    { title: 'Transaksi Intercompany', value: '18 Mutasi', subtitle: 'Buku Rekonsiliasi Holding', icon: Building2, color: 'text-blue-500' },
    { title: 'Konektor Accurate', value: 'Sinkron', subtitle: 'Update Otomatis Tiap Senin', icon: Zap, color: 'text-amber-500' }
  ]

  const shortcuts: QuickActionItem[] = [
    { label: 'Laporan Finansial Konsolidasi', href: '/ftm', icon: Coins },
    { label: 'Kepatuhan & e-Faktur Pajak', href: '/ftm', icon: Scale },
    { label: 'Buku Transaksi Antarentitas', href: '/ftm', icon: Building2 },
    { label: 'Log Sinkronisasi Accurate', href: '/ftm', icon: Zap }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="bg-primary/10 text-primary rounded-lg p-2">
            <Calculator className="size-4 sm:size-5" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">{t('title')}</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">{t('subtitle')}</p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-[11px] sm:text-xs">
          <Building2 className="mr-1 size-3 sm:size-3.5" /> {t('holdingBadge')}
        </Badge>
      </div>

      <SummaryCardGrid items={kpis} />

      <QuickActions items={shortcuts} title={tCommon('quickActions.title')} />
    </div>
  )
}
