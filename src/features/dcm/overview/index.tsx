'use client'

import { type ReactElement } from 'react'
import { BarChart3, ShoppingBag, Store, Warehouse, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SummaryCardGrid } from '@/components/card/summary-card'
import { QuickActions } from '@/components/shared/quick-actions'
import { Badge } from '@/components/ui/badge'

import type { SummaryCardItem } from '@/components/card/summary-card'
import type { QuickActionItem } from '@/components/shared/quick-actions'

export function DcmOverview(): ReactElement {
  const t = useTranslations('dcm.overview')
  const tCommon = useTranslations('common')

  const kpis: SummaryCardItem[] = [
    { title: 'Toko Marketplace', value: '4 Saluran', subtitle: 'Shopee, Tokopedia, TikTok, Web', icon: Store, color: 'text-primary' },
    { title: 'Pesanan Hari Ini', value: '48 Pesanan', subtitle: 'Agregasi Desty Omnichannel', icon: ShoppingBag, color: 'text-blue-500' },
    { title: 'Sinkronisasi Stok', value: 'Realtime', subtitle: 'Pencegahan Overselling', icon: Warehouse, color: 'text-emerald-500' },
    { title: 'GMV Saluran Digital', value: 'Rp 86 Jt', subtitle: 'Performa Penjualan Bulan Ini', icon: BarChart3, color: 'text-amber-500' }
  ]

  const shortcuts: QuickActionItem[] = [
    { label: 'Monitoring Saluran Marketplace', href: '/dcm', icon: Store },
    { label: 'Sinkronisasi Inventori Saluran', href: '/dcm', icon: Warehouse },
    { label: 'Daftar Pesanan Multichannel', href: '/dcm', icon: ShoppingBag },
    { label: 'Status Integrasi Desty API', href: '/dcm', icon: Zap }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="bg-primary/10 text-primary rounded-lg p-2">
            <Store className="size-4 sm:size-5" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">{t('title')}</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">{t('subtitle')}</p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-[11px] sm:text-xs">
          <Zap className="mr-1 size-3 sm:size-3.5" /> {t('omnichannelBadge')}
        </Badge>
      </div>

      <SummaryCardGrid items={kpis} />

      <QuickActions items={shortcuts} title={tCommon('quickActions.title')} />
    </div>
  )
}
