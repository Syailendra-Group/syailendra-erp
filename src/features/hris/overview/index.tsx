'use client'

import { type ReactElement } from 'react'
import { Briefcase, Building2, CheckCircle2, Clock, FileText, UserCheck, Users2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SummaryCardGrid } from '@/components/card/summary-card'
import { QuickActions } from '@/components/shared/quick-actions'
import { Badge } from '@/components/ui/badge'

import type { SummaryCardItem } from '@/components/card/summary-card'
import type { QuickActionItem } from '@/components/shared/quick-actions'

export function HrisOverview(): ReactElement {
  const tCommon = useTranslations('common')
  const kpis: SummaryCardItem[] = [
    { title: 'Karyawan Hadir Hari Ini', value: '28 / 32', subtitle: '87.5% Tingkat Kehadiran', icon: UserCheck, color: 'text-emerald-500' },
    { title: 'Terlambat / Izin', value: '4 Orang', subtitle: '2 Izin Lapangan • 2 Shift Siang', icon: Clock, color: 'text-amber-500' },
    { title: 'Total SDM Terdaftar', value: '32 Karyawan', subtitle: 'Terhubung hr.employee Odoo 18', icon: Users2, color: 'text-primary' },
    { title: 'Laporan Kerja Masuk', value: '14 Laporan', subtitle: 'Aktivitas kebun & pabrik', icon: FileText, color: 'text-blue-500' }
  ]

  const shortcuts: QuickActionItem[] = [
    { label: 'Presensi 1-Tap Masuk/Pulang', href: '/hris', icon: Clock },
    { label: 'Direktori Karyawan', href: '/employees', icon: Briefcase },
    { label: 'Struktur Departemen', href: '/admin/departments', icon: Building2 },
    { label: 'Input Laporan Lapangan', href: '/hris', icon: FileText }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="bg-primary/10 text-primary rounded-lg p-2">
            <Clock className="size-4 sm:size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Ketenagakerjaan & HRIS</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">Manajemen presensi real-time, shift operasional, & direktori staf PT. SBI</p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-[11px] sm:text-xs">
          <CheckCircle2 className="mr-1 size-3 sm:size-3.5" /> hr.attendance Live
        </Badge>
      </div>

      <SummaryCardGrid items={kpis} />

      <QuickActions items={shortcuts} title={tCommon('quickActions.hris')} />
    </div>
  )
}
