'use client'

import { type ReactElement } from 'react'
import { ArrowRight, CheckCircle2, GitBranch, Layers, QrCode, RotateCcw, ShieldCheck, Tag } from 'lucide-react'

import { QuickActions } from '@/components/shared/quick-actions'
import { SummaryCardGrid } from '@/components/shared/summary-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Link } from '@/i18n/navigation'

import type { QuickActionItem } from '@/components/shared/quick-actions'
import type { SummaryCardItem } from '@/components/shared/summary-card'

export function TraceabilityOverview(): ReactElement {
  const kpis: SummaryCardItem[] = [
    { title: 'Total Lot Terlacak', value: '24 Batches', subtitle: 'Hulu s/d Hilir', icon: Tag, color: 'text-primary' },
    { title: 'Sesi Suling Aktif', value: '1 Ketel', subtitle: 'Metode Steam Suling', icon: Layers, color: 'text-blue-500' },
    { title: 'QC Release Hijau', value: '19 Batches', subtitle: 'Tersertifikasi COA Lab', icon: ShieldCheck, color: 'text-emerald-500' },
    { title: 'Terkunci Karantina', value: '1 Batch', subtitle: 'Menunggu GC-MS Lab', icon: RotateCcw, color: 'text-amber-500' }
  ]

  const shortcuts: QuickActionItem[] = [
    { label: 'Daftar Master Lot', href: '/traceability', icon: Tag },
    { label: 'Pohon Silsilah (DAG)', href: '/traceability', icon: GitBranch },
    { label: 'Cetak Label QR', href: '/traceability', icon: QrCode },
    { label: 'Cockpit Mock Recall', href: '/traceability', icon: RotateCcw }
  ]

  const batches = [
    { code: 'FG-AGO-2026-0045', commodity: 'Minyak Gaharu 100ml', origin: 'Dieng (Pak Joko)', coa: 'COA-SBI-2026-091', status: 'RELEASED' },
    { code: 'FG-AGO-2026-0045-SMP', commodity: 'Minyak Gaharu 1ml Sample', origin: 'Dieng (Pak Joko)', coa: 'COA-SBI-2026-091', status: 'RELEASED' },
    { code: 'RM-AGO-2026-001', commodity: 'Crude Gaharu QC Approved', origin: 'Ketel Temanggung', coa: 'COA-SBI-2026-091', status: 'APPROVED' },
    { code: 'RM-PAC-2026-0002', commodity: 'Minyak Nilam Mentah', origin: 'Sumbing Prima', coa: 'Pending GC-MS', status: 'QUARANTINE' },
    { code: 'RM-CIT-2026-0003', commodity: 'Minyak Serai Wangi', origin: 'Supplier Reject', coa: 'Gagal Uji Indeks Bias', status: 'REJECTED' }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="bg-primary/10 text-primary rounded-lg p-2">
            <Layers className="size-4 sm:size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Traceability & Silsilah Batch</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">Engine penelusuran silsilah 7-lapisan Farm-to-Consumer DDistillers</p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-[11px] sm:text-xs">
          <CheckCircle2 className="mr-1 size-3 sm:size-3.5" /> ISO 22000 & GMP Ready
        </Badge>
      </div>

      <SummaryCardGrid items={kpis} />

      <QuickActions items={shortcuts} title="Aksi Silsilah & QR:" />

      <Card className="shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base">Daftar Silsilah Batch Terkini</CardTitle>
          <CardDescription className="text-xs">Status penelusuran lot hulu ke hilir berbasis data aktif Odoo 18</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Nomor Lot / Batch</TableHead>
                  <TableHead className="text-xs">Komoditas Produk</TableHead>
                  <TableHead className="text-xs">Asal Hulu / Terroir</TableHead>
                  <TableHead className="text-xs">Nomor COA Lab</TableHead>
                  <TableHead className="text-xs">Status Mutu</TableHead>
                  <TableHead className="text-right text-xs">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((b) => (
                  <TableRow key={b.code}>
                    <TableCell className="text-primary font-mono text-xs font-semibold">{b.code}</TableCell>
                    <TableCell className="text-xs font-medium">{b.commodity}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{b.origin}</TableCell>
                    <TableCell className="font-mono text-xs">{b.coa}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          b.status === 'RELEASED' || b.status === 'APPROVED'
                            ? 'border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400'
                            : b.status === 'QUARANTINE'
                              ? 'border-amber-500/20 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400'
                              : 'border-destructive/20 bg-destructive/10 text-destructive text-[10px]'
                        }
                      >
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild className="h-6 cursor-pointer px-2 text-[11px] sm:h-7 sm:text-xs">
                        <Link href={`/trace/${b.code}`}>
                          <span>Lihat QR</span>
                          <ArrowRight className="ml-1 size-3" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
