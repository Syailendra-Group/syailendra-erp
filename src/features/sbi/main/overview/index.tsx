'use client'

import { Activity, Clock, Layers, LayoutDashboard, Sparkles, Target, Users, Warehouse } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SummaryCardGrid } from '@/components/card/summary-card'
import { PageHeader } from '@/components/shared/page-header'
import { QuickActions } from '@/components/shared/quick-actions'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { SummaryCardItem } from '@/components/card/summary-card'
import type { QuickActionItem } from '@/components/shared/quick-actions'
import type { ReactElement } from 'react'

export function MainOverview(): ReactElement {
  const t = useTranslations('main.overview')
  const tCommon = useTranslations('common')

  const kpis: SummaryCardItem[] = [
    { title: t('kpis.systemConnected'), value: 'Odoo 18 CE', subtitle: t('kpis.subtitles.odoo'), icon: Activity, color: 'text-primary' },
    { title: t('kpis.activeGenealogy'), value: '24 Batches', subtitle: t('kpis.subtitles.traceable'), icon: Layers, color: 'text-blue-500' },
    { title: t('kpis.wmsStorage'), value: '3 Zona Fisik', subtitle: t('kpis.subtitles.zones'), icon: Warehouse, color: 'text-amber-500' },
    { title: t('kpis.workforce'), value: '32 Personel', subtitle: t('kpis.subtitles.personnel'), icon: Users, color: 'text-emerald-500' }
  ]

  const shortcuts: QuickActionItem[] = [
    { label: t('shortcuts.lotTrace'), href: '/scm', icon: Layers },
    { label: t('shortcuts.wmsLedger'), href: '/wms', icon: Warehouse },
    { label: t('shortcuts.crmPipeline'), href: '/crm', icon: Target },
    { label: t('shortcuts.hrisAttendance'), href: '/hris', icon: Clock }
  ]

  const recentActivities = [
    { id: 'ACT-01', title: 'Batch Minyak Gaharu 100ml Selesai Dikemas', tag: 'FG-AGO-2026-0045', time: '10 mnt lalu', status: 'RELEASED' },
    { id: 'ACT-02', title: 'Sesi Suling Ketel Uap Temanggung Berhasil', tag: 'DSTB-2026-09-001', time: '1 jam lalu', status: 'DONE' },
    { id: 'ACT-03', title: 'Penerimaan Bahan Baku Nilam Baru Tiba', tag: 'RM-PAC-2026-0002', time: '3 jam lalu', status: 'QUARANTINE' },
    { id: 'ACT-04', title: 'Pengiriman Ekspor B2B Paris Diserahkan ke FedEx', tag: 'SHIP-2026-09-012', time: 'Kemarin', status: 'SHIPPED' }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        icon={LayoutDashboard}
        actions={
          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-[11px] sm:text-xs">
            <Sparkles className="mr-1 size-3 sm:size-3.5" /> Live Production
          </Badge>
        }
      />

      {/* Reusable Compact Summary Cards (Grid 2 Mobile, Grid 4 Desktop) */}
      <SummaryCardGrid items={kpis} />

      {/* Reusable Quick Actions Bar */}
      <QuickActions items={shortcuts} title={tCommon('quickActions.main')} />

      {/* Analytics & Activity Table */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-7">
        <Card className="shadow-xs lg:col-span-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base">{t('distribution.title')}</CardTitle>
            <CardDescription className="text-xs">{t('distribution.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>{t('distribution.traceability')}</span>
                <span className="text-primary font-semibold">{t('distribution.traceabilityStatus')}</span>
              </div>
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full sm:h-2">
                <div className="bg-primary h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>{t('distribution.warehouse')}</span>
                <span className="font-semibold text-blue-500">{t('distribution.warehouseStatus')}</span>
              </div>
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full sm:h-2">
                <div className="h-full rounded-full bg-blue-500" style={{ width: '48%' }} />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>{t('distribution.crm')}</span>
                <span className="font-semibold text-amber-500">{t('distribution.crmStatus')}</span>
              </div>
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full sm:h-2">
                <div className="h-full rounded-full bg-amber-500" style={{ width: '75%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base">{t('activities.title')}</CardTitle>
            <CardDescription className="text-xs">{t('activities.subtitle')}</CardDescription>
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
