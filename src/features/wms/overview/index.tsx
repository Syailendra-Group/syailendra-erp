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
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Manajemen Pergudangan (WMS)</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">Pengelolaan persediaan fisik multi-lokasi & alur mutasi barang</p>
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
            <CardTitle className="text-sm sm:text-base">Distribusi Lokasi Fisik Gudang</CardTitle>
            <CardDescription className="text-xs">Pemetaan saldo inventaris pada 3 zona utama Odoo 18</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b pb-2.5 sm:pb-3">
              <div>
                <p className="text-xs font-semibold sm:text-sm">WH/Approved (Bahan Siap Produksi)</p>
                <span className="text-muted-foreground text-[11px]">Lokasi rak: Z1-R02-B01</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 sm:text-sm">8.2 Kg (Gaharu Murni)</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2.5 sm:pb-3">
              <div>
                <p className="text-xs font-semibold sm:text-sm">WH/Quarantine (Karantina Lab)</p>
                <span className="text-muted-foreground text-[11px]">Status: Lockout mrp.production</span>
              </div>
              <span className="text-xs font-bold text-amber-600 sm:text-sm">24.5 Kg (Nilam Mentah)</span>
            </div>
            <div className="flex items-center justify-between pb-1">
              <div>
                <p className="text-xs font-semibold sm:text-sm">WH/Reject (Klaim Retur Supplier)</p>
                <span className="text-muted-foreground text-[11px]">Status: Out of Spec (DISC-2026-0014)</span>
              </div>
              <span className="text-destructive text-xs font-bold sm:text-sm">10.0 Kg (Serai Reject)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base">Prosedur Karantina & SOP Unboxing</CardTitle>
            <CardDescription className="text-xs">Kepatuhan gerbang penerimaan barang PT. SBI</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2.5 text-xs leading-relaxed sm:space-y-3">
            <p>
              • <strong>SOP Unboxing:</strong> Seluruh penerimaan minyak atsiri wajib dilengkapi rekaman video uncut dan foto 4 sisi kemasan.
            </p>
            <p>
              • <strong>Label Kuning:</strong> Ditempelkan saat tiba di receiving dan otomatis mengunci stok dari modul produksi.
            </p>
            <p>
              • <strong>Otorisasi QC:</strong> Hanya akun berwenang yang dapat memindahkan stok dari Karantina ke Approved.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
