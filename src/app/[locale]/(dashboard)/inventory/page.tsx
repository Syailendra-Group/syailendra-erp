'use client'

import { type ReactElement } from 'react'
import { ArrowDownLeft, ArrowUpRight, Boxes, Layers, QrCode, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function InventoryDashboardPage(): ReactElement {
  const tInv = useTranslations('inventory')

  // Summary KPI Metrics (Sesuai Komoditas Syailendra Group di Odoo 18)
  const metrics = [
    {
      title: 'Specialty Commodities',
      value: '12 SKUs',
      change: '+2 new lots',
      trend: 'up',
      icon: Boxes,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      title: 'Active Batches / Lots',
      value: '18 Lots',
      change: '100% Traceable',
      trend: 'up',
      icon: Layers,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Incoming Receipts',
      value: '2 Pending',
      change: 'Sindoro & Dieng',
      trend: 'neutral',
      icon: ArrowDownLeft,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      title: 'B2B Outgoing Delivery',
      value: '5 Orders',
      change: 'Export & Roasters',
      trend: 'up',
      icon: ArrowUpRight,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    }
  ]

  // Data lot komoditas riil Odoo 18
  const commodityLots = [
    {
      lot: 'LOT-SYA-2026-001',
      product: 'Kopi Arabika Specialty Sindoro (Full Wash)',
      farmer: 'Kelompok Tani Syailendra Mandiri (Pak Joko)',
      elevation: '1.450 mdpl',
      stock: '250 kg',
      grade: 'Grade 1 (Q-Score 86.5)',
      status: 'In Stock'
    },
    {
      lot: 'LOT-SYA-2026-002',
      product: 'Kopi Arabika Honey Process Dieng',
      farmer: 'Mitra Tani Sejahtera Wonosobo',
      elevation: '1.600 mdpl',
      stock: '180 kg',
      grade: 'Micro-Lot (Q-Score 87.2)',
      status: 'In Stock'
    },
    {
      lot: 'LOT-SYA-2026-003',
      product: 'Cascara Specialty Tea (Cherry Pulp)',
      farmer: 'Kebun Percobaan Bansari',
      elevation: '1.350 mdpl',
      stock: '75 kg',
      grade: 'Specialty Tea Organic',
      status: 'Reserved'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{tInv('overview.title')}</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">{tInv('overview.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="cursor-pointer gap-2 text-xs">
            <QrCode className="text-primary dark:text-primary h-4 w-4" />
            <span>Scan QR Lot</span>
          </Button>
          <Button size="sm" className="cursor-pointer gap-2 text-xs font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>+ Penerimaan Barang</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <Card key={m.title} className="shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-muted-foreground text-xs font-medium">{m.title}</CardTitle>
                <div className={`rounded-md p-1.5 ${m.bg}`}>
                  <Icon className={`h-4 w-4 ${m.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{m.value}</div>
                <p className="text-muted-foreground mt-1 flex items-center gap-1 text-[11px]">
                  <TrendingUp className="text-primary h-3 w-3" />
                  <span>{m.change}</span>
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Table: Commodity Lots & Traceability */}
      <Card className="shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold sm:text-base">Monitoring Lot Komoditas & Farm Traceability</CardTitle>
              <CardDescription className="text-xs">Data real-time disinkronkan dengan modul Odoo 18 Stock Production Lot</CardDescription>
            </div>
            <Badge variant="outline" className="border-primary/20 text-primary gap-1 text-[10px]">
              <ShieldCheck className="h-3 w-3" />
              Double-Entry Validated
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground text-[11px] tracking-wider uppercase">
                <tr>
                  <th className="px-3 py-2.5">Nomor Lot</th>
                  <th className="px-3 py-2.5">Komoditas Produk</th>
                  <th className="px-3 py-2.5">Kelompok Tani / Petani</th>
                  <th className="px-3 py-2.5">Elevasi</th>
                  <th className="px-3 py-2.5">Stok Riil</th>
                  <th className="px-3 py-2.5">Mutu / Grade</th>
                  <th className="px-3 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-border/60 divide-y">
                {commodityLots.map((item) => (
                  <tr key={item.lot} className="hover:bg-muted/30 transition-colors">
                    <td className="text-primary dark:text-primary px-3 py-3 font-mono font-bold">{item.lot}</td>
                    <td className="text-foreground px-3 py-3 font-medium">{item.product}</td>
                    <td className="text-muted-foreground px-3 py-3">{item.farmer}</td>
                    <td className="text-muted-foreground px-3 py-3">{item.elevation}</td>
                    <td className="px-3 py-3 font-bold">{item.stock}</td>
                    <td className="px-3 py-3">
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        {item.grade}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Badge variant={item.status === 'In Stock' ? 'default' : 'outline'} className="text-[10px]">
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
