import { type ReactElement } from 'react'
import { Target, TrendingUp, Users } from 'lucide-react'

import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CrmOverviewPage(): ReactElement {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'B2B CRM' }]} />

      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">B2B CRM & Kemitraan Komoditas</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Pipeline kemitraan, kontrak suplai green bean kopi, dan riwayat pesanan B2B Syailendra Group.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="dark:bg-card border-border/40 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Mitra Aktif</CardTitle>
            <Users className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 Mitra</div>
            <p className="text-muted-foreground mt-1 text-xs">Roastery & Eksportir terverifikasi</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-card border-border/40 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Pipeline Negosiasi</CardTitle>
            <Target className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 480.000.000</div>
            <p className="text-muted-foreground mt-1 text-xs">4 Kontrak suplai kuartal 4</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-card border-border/40 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Volume Terkirim</CardTitle>
            <TrendingUp className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18,5 Ton</div>
            <p className="text-muted-foreground mt-1 text-xs">Realisasi pengiriman tahun 2026</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
