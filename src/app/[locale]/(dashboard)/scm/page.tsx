'use client'

import { useRouter } from 'next/navigation'
import { Activity, ArrowUpRight, CheckCircle2, Droplet, FlaskConical, LayoutDashboard, TrendingUp, Wheat } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MOCK_HARVEST_ITEMS, MOCK_QC_ITEMS } from '@/data/scm-demo-data'

export default function SCMOverviewPage() {
  const t = useTranslations('scm.demo.overview')
  const router = useRouter()

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={LayoutDashboard} />

      {/* Row 1: Bento Grid 4 KPI Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">{t('kpi.biomass')}</CardTitle>
            <Wheat className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold">48,250 Kg</div>
            <p className="flex items-center gap-1 pt-1 text-[11px] font-medium text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              <span>{t('kpi.biomassTrend')}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">{t('kpi.oil')}</CardTitle>
            <Droplet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold">1,280.40 Kg</div>
            <p className="flex items-center gap-1 pt-1 text-[11px] font-medium text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              <span>{t('kpi.oilTrend')}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">{t('kpi.yield')}</CardTitle>
            <Activity className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold">2.65%</div>
            <p className="text-muted-foreground pt-1 text-[11px]">{t('kpi.yieldTarget')}</p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">{t('kpi.qcPass')}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold">98.4%</div>
            <p className="pt-1 text-[11px] font-medium text-emerald-600">{t('kpi.qcPassDesc')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Visual Yield Trends & Supply Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border shadow-xs lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">{t('charts.yieldTrend')}</CardTitle>
            <p className="text-muted-foreground text-xs">{t('charts.yieldTrendDesc')}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>{t('charts.patchouli')} (Pogostemon cablin)</span>
                  <span className="font-mono font-bold text-emerald-600">2.76% (Target 2.50%)</span>
                </div>
                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div className="h-full w-[88%] rounded-full bg-emerald-600" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>{t('charts.clove')} (Syzygium aromaticum)</span>
                  <span className="font-mono font-bold text-blue-600">2.84% (Target 2.80%)</span>
                </div>
                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div className="h-full w-[92%] rounded-full bg-blue-600" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>{t('charts.citronella')} (Cymbopogon nardus)</span>
                  <span className="font-mono font-bold text-amber-600">1.25% (Target 1.20%)</span>
                </div>
                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div className="h-full w-[75%] rounded-full bg-amber-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">{t('charts.supplySource')}</CardTitle>
            <p className="text-muted-foreground text-xs">{t('charts.supplySourceDesc')}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2 text-xs">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                <span>Petani Binaan</span>
              </span>
              <span className="font-mono font-bold">68%</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2 text-xs">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                <span>Penyuling Mandiri</span>
              </span>
              <span className="font-mono font-bold">24%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-600" />
                <span>Koperasi / Mitra</span>
              </span>
              <span className="font-mono font-bold">8%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Actionable Feeds */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Harvest Sessions */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold">{t('feeds.recentHarvest')}</CardTitle>
              <p className="text-muted-foreground text-xs">{t('feeds.recentHarvestDesc')}</p>
            </div>
            <Button variant="ghost" className="cursor-pointer gap-1 text-xs" onClick={() => router.push('/scm/harvest')}>
              <span>{t('feeds.viewAllHarvest')}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_HARVEST_ITEMS.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md border p-2.5 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-mono font-bold">{item.code}</span>
                    <span className="text-muted-foreground">- {item.commodity}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">{item.farmer}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-semibold">{item.weight} Kg</span>
                  <Badge variant="outline" className="mt-0.5 block text-[10px] font-normal">
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending QC Batches */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold">{t('feeds.pendingQC')}</CardTitle>
              <p className="text-muted-foreground text-xs">{t('feeds.pendingQCDesc')}</p>
            </div>
            <Button variant="ghost" className="cursor-pointer gap-1 text-xs" onClick={() => router.push('/scm/qc')}>
              <span>{t('feeds.viewAllQC')}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_QC_ITEMS.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md border p-2.5 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="text-primary h-3.5 w-3.5" />
                    <span className="text-primary font-mono font-bold">{item.code}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">{item.marker}</p>
                </div>
                <div className="text-right">
                  <Badge variant={item.result === 'passed' ? 'default' : 'outline'} className="text-[10px]">
                    {item.result === 'passed' ? 'Lolos Ekspor' : 'Karantina'}
                  </Badge>
                  <p className="text-muted-foreground mt-0.5 font-mono text-[10px]">{item.coa}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
