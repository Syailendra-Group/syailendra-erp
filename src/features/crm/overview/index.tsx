'use client'

import { type ReactElement } from 'react'
import { FlaskConical, Globe, ShoppingBag, Target, TrendingUp, Truck, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SummaryCardGrid } from '@/components/card/summary-card'
import { QuickActions } from '@/components/shared/quick-actions'
import { Badge } from '@/components/ui/badge'

import type { SummaryCardItem } from '@/components/card/summary-card'
import type { QuickActionItem } from '@/components/shared/quick-actions'

export function CrmOverview(): ReactElement {
  const tCommon = useTranslations('common')
  const kpis: SummaryCardItem[] = [
    { title: 'Pesanan Web Global', value: '12 Orders', subtitle: 'Website DDistillers.com', icon: ShoppingBag, color: 'text-primary' },
    { title: 'Permintaan Sampel', value: '8 Requests', subtitle: 'Kuota 3 Gratis • Ongkir Lunas', icon: FlaskConical, color: 'text-blue-500' },
    { title: 'Pengiriman Ekspor', value: '5 Shipments', subtitle: 'Integrasi API FedEx Direct', icon: Truck, color: 'text-amber-500' },
    { title: 'Pipeline B2B Leads', value: 'Rp 450 Jt', subtitle: 'Prospek Buyer Internasional', icon: TrendingUp, color: 'text-emerald-500' }
  ]

  const shortcuts: QuickActionItem[] = [
    { label: 'Pipeline Prospek B2B', href: '/crm', icon: Users },
    { label: 'Pesanan Website Ekspor', href: '/crm', icon: ShoppingBag },
    { label: 'Meja Sampel (1ml/5ml)', href: '/crm', icon: FlaskConical },
    { label: 'Pelacak Resi FedEx', href: '/crm', icon: Truck }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="bg-primary/10 text-primary rounded-lg p-2">
            <Target className="size-4 sm:size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Komersial & Global CRM</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">Penjualan B2B internasional, pesanan website, & pengiriman sampel DDistillers</p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-[11px] sm:text-xs">
          <Globe className="mr-1 size-3 sm:size-3.5" /> FedEx API Connected
        </Badge>
      </div>

      <SummaryCardGrid items={kpis} />

      <QuickActions items={shortcuts} title={tCommon('quickActions.crm')} />
    </div>
  )
}
