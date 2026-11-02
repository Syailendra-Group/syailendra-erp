'use client'

import { type ReactElement } from 'react'
import { BookOpen, Building, History, Shield, Sliders, UserPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SummaryCardGrid } from '@/components/card/summary-card'
import { QuickActions } from '@/components/shared/quick-actions'
import { Badge } from '@/components/ui/badge'

import type { SummaryCardItem } from '@/components/card/summary-card'
import type { QuickActionItem } from '@/components/shared/quick-actions'

export function SettingsOverview(): ReactElement {
  const tCommon = useTranslations('common')
  const kpis: SummaryCardItem[] = [
    { title: 'Status Akun Pengguna', value: 'Active', subtitle: 'Role-Based Access Control', icon: Shield, color: 'text-primary' },
    { title: 'Perusahaan Terhubung', value: 'PT. SBI', subtitle: 'DDistillers Multi-Company', icon: Building, color: 'text-blue-500' },
    { title: 'Mitra & Supplier', value: '4 Entitas', subtitle: 'Petani, Suling, & Supplier', icon: UserPlus, color: 'text-emerald-500' },
    { title: 'Log Audit Keamanan', value: 'Immutable', subtitle: 'Traceability Compliance Log', icon: History, color: 'text-amber-500' }
  ]

  const shortcuts: QuickActionItem[] = [
    { label: 'Profil Perusahaan', href: '/admin/company', icon: Building },
    { label: 'Hak Akses & RBAC', href: '/admin/roles', icon: Shield },
    { label: 'Master Petani & Supplier', href: '/settings', icon: UserPlus },
    { label: 'Manual SOP & Panduan', href: '/settings', icon: BookOpen }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="bg-primary/10 text-primary rounded-lg p-2">
            <Sliders className="size-4 sm:size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Sistem & Pengaturan (OTHERS)</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">Tata kelola sistem, profil korporat, matriks hak akses, & manual SOP</p>
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
