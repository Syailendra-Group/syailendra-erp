'use client'

import { type ReactElement } from 'react'
import { ArrowDownLeft, ArrowUpRight, Boxes, FileSpreadsheet, MapPin, Package, RotateCcw, ShieldCheck, Warehouse } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SummaryCardGrid } from '@/components/card/summary-card'
import { QuickActions } from '@/components/shared/quick-actions'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { SummaryCardItem } from '@/components/card/summary-card'
import type { QuickActionItem } from '@/components/shared/quick-actions'

export function WmsOverview(): ReactElement {
  const t = useTranslations('wms.overview')
  const tCommon = useTranslations('common')
  const kpis: SummaryCardItem[] = [
    { title: 'Saldo Stok Siap Pakai', value: '58.2 Kg', subtitle: 'WH/Approved • Lolos QC', icon: ShieldCheck, color: 'text-emerald-500' },
    { title: 'Stok Terkunci Karantina', value: '24.5 Kg', subtitle: 'WH/Quarantine • Menunggu Lab', icon: RotateCcw, color: 'text-amber-500' },
    { title: 'Produk Jadi Terkemas', value: '170 Units', subtitle: 'WH/Stock • Botol & Sampel', icon: Package, color: 'text-primary' },
    { title: 'Stok Terisolasi Reject', value: '10.0 Kg', subtitle: 'WH/Reject • Retur Supplier', icon: Boxes, color: 'text-destructive' }
  ]

  const shortcuts: QuickActionItem[] = [
    { label: 'Buku Stok Fisik', href: '/wms', icon: FileSpreadsheet },
    { label: 'Penerimaan Inbound (GRN)', href: '/wms', icon: ArrowDownLeft },
    { label: 'Zona Karantina QC', href: '/wms', icon: ShieldCheck },
    { label: 'Pengeluaran Outbound', href: '/wms', icon: ArrowUpRight },
    { label: 'Tata Letak Rak/Bin', href: '/wms', icon: MapPin }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="bg-primary/10 text-primary rounded-lg p-2">
            <Warehouse className="size-4 sm:size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t('title')}</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">{t('subtitle')}</p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-[11px] sm:text-xs">
          FEFO Routing Active
        </Badge>
      </div>

      <SummaryCardGrid items={kpis} />

      <QuickActions items={shortcuts} title={tCommon('quickActions.wms')} />

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base">{t('distribution.title')}</CardTitle>
            <CardDescription className="text-xs">{t('distribution.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b pb-2.5 sm:pb-3">
              <div>
                <p className="text-xs font-semibold sm:text-sm">{t('distribution.approved')}</p>
                <span className="text-muted-foreground text-[11px]">{t('distribution.approvedRack')}</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 sm:text-sm">{t('distribution.approvedQty')}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2.5 sm:pb-3">
              <div>
                <p className="text-xs font-semibold sm:text-sm">{t('distribution.quarantine')}</p>
                <span className="text-muted-foreground text-[11px]">{t('distribution.quarantineStatus')}</span>
              </div>
              <span className="text-xs font-bold text-amber-600 sm:text-sm">{t('distribution.quarantineQty')}</span>
            </div>
            <div className="flex items-center justify-between pb-1">
              <div>
                <p className="text-xs font-semibold sm:text-sm">{t('distribution.reject')}</p>
                <span className="text-muted-foreground text-[11px]">{t('distribution.rejectStatus')}</span>
              </div>
              <span className="text-destructive text-xs font-bold sm:text-sm">{t('distribution.rejectQty')}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base">{t('sop.title')}</CardTitle>
            <CardDescription className="text-xs">{t('sop.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2.5 text-xs leading-relaxed sm:space-y-3">
            <p>
              • <strong>{t('sop.unboxing')}</strong> {t('sop.unboxingDesc')}
            </p>
            <p>
              • <strong>{t('sop.yellowLabel')}</strong> {t('sop.yellowLabelDesc')}
            </p>
            <p>
              • <strong>{t('sop.qcAuth')}</strong> {t('sop.qcAuthDesc')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
