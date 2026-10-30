'use client'

import { type ReactElement } from 'react'
import { Activity, Clock, Layers, LayoutDashboard, Sparkles, Target, Users, Warehouse } from 'lucide-react'

import { QuickActions } from '@/components/shared/quick-actions'
import { SummaryCardGrid } from '@/components/shared/summary-card'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { QuickActionItem } from '@/components/shared/quick-actions'
import type { SummaryCardItem } from '@/components/shared/summary-card'

export function MainOverview(): ReactElement {
  const kpis: SummaryCardItem[] = [
    { title: 'Sistem Terhubung', value: 'Odoo 18 CE', subtitle: 'PostgreSQL 15 Alpine', icon: Activity, color: 'text-primary' },
    { title: 'Silsilah Aktif', value: '24 Batches', subtitle: '100% Full Chain Traceable', icon: Layers, color: 'text-blue-500' },
    { title: 'Pergudangan (WMS)', value: '3 Zona Fisik', subtitle: 'Quarantine • Approved • Reject', icon: Warehouse, color: 'text-amber-500' },
    { title: 'Karyawan & Mitra', value: '32 Personel', subtitle: 'Petani, QC, Pabrik, & Staff', icon: Users, color: 'text-emerald-500' }
  ]

  const shortcuts: QuickActionItem[] = [
    { label: 'Ketertelusuran Lot', href: '/traceability', icon: Layers },
    { label: 'Buku Stok WMS', href: '/wms', icon: Warehouse },
    { label: 'Pipeline CRM B2B', href: '/crm', icon: Target },
    { label: 'Presensi Karyawan', href: '/hris', icon: Clock }
  ]

  const recentActivities = [
    { id: 'ACT-01', title: 'Batch Minyak Gaharu 100ml Selesai Dikemas', tag: 'FG-AGO-2026-0045', time: '10 mnt lalu', status: 'RELEASED' },
    { id: 'ACT-02', title: 'Sesi Suling Ketel Uap Temanggung Berhasil', tag: 'DSTB-2026-09-001', time: '1 jam lalu', status: 'DONE' },
    { id: 'ACT-03', title: 'Penerimaan Bahan Baku Nilam Baru Tiba', tag: 'RM-PAC-2026-0002', time: '3 jam lalu', status: 'QUARANTINE' },
    { id: 'ACT-04', title: 'Pengiriman Ekspor B2B Paris Diserahkan ke FedEx', tag: 'SHIP-2026-09-012', time: 'Kemarin', status: 'SHIPPED' }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="bg-primary/10 text-primary rounded-lg p-2">
            <LayoutDashboard className="size-4 sm:size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Ruang Kendali Utama (MAIN)</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Pusat operasional eksekutif & ringkasan terintegrasi PT. Syailendra Bumi Investama
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-[11px] sm:text-xs">
            <Sparkles className="mr-1 size-3 sm:size-3.5" /> Live Production
          </Badge>
        </div>
      </div>

      {/* Reusable Compact Summary Cards (Grid 2 Mobile, Grid 4 Desktop) */}
      <SummaryCardGrid items={kpis} />

      {/* Reusable Quick Actions Bar */}
      <QuickActions items={shortcuts} />

      {/* Analytics & Activity Table */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-7">
        <Card className="shadow-xs lg:col-span-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base">Distribusi Arsitektur Rantai Pasok</CardTitle>
            <CardDescription className="text-xs">Integrasi 6 modul strategis DDistillers pada backend Odoo 18</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>Traceability & Mutu QC</span>
                <span className="text-primary font-semibold">100% Terverifikasi</span>
              </div>
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full sm:h-2">
                <div className="bg-primary h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>Kapasitas Gudang Utama (WMS)</span>
                <span className="font-semibold text-blue-500">48% Terisi</span>
              </div>
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full sm:h-2">
                <div className="h-full rounded-full bg-blue-500" style={{ width: '48%' }} />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>Kualifikasi Leads B2B Ekspor (CRM)</span>
                <span className="font-semibold text-amber-500">75% Tahap Negosiasi</span>
              </div>
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full sm:h-2">
                <div className="h-full rounded-full bg-amber-500" style={{ width: '75%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base">Aktivitas Terkini</CardTitle>
            <CardDescription className="text-xs">Log pergerakan batch & status sistem real-time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 sm:space-y-3">
            {recentActivities.map((act) => (
              <div key={act.id} className="border-border/40 flex items-center justify-between border-b pb-2.5 last:border-0 last:pb-0">
                <div>
                  <p className="text-xs leading-tight font-medium">{act.title}</p>
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {act.tag} • {act.time}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                  {act.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
