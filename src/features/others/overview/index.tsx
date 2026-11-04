'use client'

import { type ReactElement } from 'react'
import { Building, Globe, History, Shield, Sliders } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SummaryCardGrid } from '@/components/card/summary-card'
import { QuickActions } from '@/components/shared/quick-actions'
import { Badge } from '@/components/ui/badge'

import type { SummaryCardItem } from '@/components/card/summary-card'
import type { QuickActionItem } from '@/components/shared/quick-actions'

export function OthersOverview(): ReactElement {
  const t = useTranslations('others.overview')
  const tCommon = useTranslations('common')
  const kpis: SummaryCardItem[] = [
    { title: 'Status Akun Pengguna', value: 'Active', subtitle: 'Role-Based Access Control', icon: Shield, color: 'text-primary' },
    { title: 'Perusahaan Terhubung', value: 'PT. SBI', subtitle: 'DDistillers Multi-Company', icon: Building, color: 'text-blue-500' },
    { title: 'Master Wilayah Resmi', value: '5 Tingkat', subtitle: 'Negara s/d Kelurahan', icon: Globe, color: 'text-emerald-500' },
    { title: 'Log Audit Keamanan', value: 'Immutable', subtitle: 'Traceability Compliance Log', icon: History, color: 'text-amber-500' }
  ]

  const shortcuts: QuickActionItem[] = [
    { label: 'Master Negara & Provinsi', href: '/others/provinces', icon: Globe },
    { label: 'Master Kab, Kec & Desa', href: '/others/regencies', icon: Globe },
    { label: 'Profil Perusahaan', href: '/others/company', icon: Building },
    { label: 'Hak Akses & RBAC', href: '/others/roles', icon: Shield }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="bg-primary/10 text-primary rounded-lg p-2">
            <Sliders className="size-4 sm:size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t('title')}</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Pusat master data wilayah Indonesia, profil holding, hak akses RBAC, dan audit kepatuhan
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-[11px] sm:text-xs">
          Governance Active
        </Badge>
      </div>

      <SummaryCardGrid items={kpis} />

      <QuickActions items={shortcuts} title={tCommon('quickActions.settings')} />
    </div>
  )
}
