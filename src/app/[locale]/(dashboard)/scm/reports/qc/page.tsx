'use client'

import { ShieldCheck } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function SCMReportQCPage() {

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Riwayat Mutu & Standar Kepatuhan ISO/ECHA"
        description="Pencatatan kepatuhan spesifikasi teknis ekspor, ambang batas marker, dan riwayat CoA"
        icon={ShieldCheck}
      />

      <Card className="shadow-xs border">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Rekapitulasi Pengujian Laboratorium Minyak Atsiri</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor COA</TableHead>
                <TableHead>Komoditas</TableHead>
                <TableHead>Standar ISO</TableHead>
                <TableHead>Marker Compound</TableHead>
                <TableHead>Hasil Uji</TableHead>
                <TableHead className="text-center">Keputusan Mutu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs font-bold text-primary">COA-SBI-2026-042</TableCell>
                <TableCell className="text-xs">Nilam Jawa Super</TableCell>
                <TableCell className="text-xs">ISO 4724:2004</TableCell>
                <TableCell className="text-xs">Patchouli Alcohol (PA)</TableCell>
                <TableCell className="font-mono text-xs font-bold text-emerald-600">32.40% (Min: 30%)</TableCell>
                <TableCell className="text-center text-xs font-semibold text-emerald-700">Lolos Ekspor</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs font-bold text-primary">COA-SBI-2026-041</TableCell>
                <TableCell className="text-xs">Daun Cengkeh</TableCell>
                <TableCell className="text-xs">ISO 3141:1997</TableCell>
                <TableCell className="text-xs">Eugenol Content</TableCell>
                <TableCell className="font-mono text-xs font-bold text-emerald-600">79.20% (Min: 78%)</TableCell>
                <TableCell className="text-center text-xs font-semibold text-emerald-700">Lolos Ekspor</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs font-bold text-primary">COA-SBI-2026-040</TableCell>
                <TableCell className="text-xs">Serai Wangi</TableCell>
                <TableCell className="text-xs">ISO 3848:2016</TableCell>
                <TableCell className="text-xs">Total Geraniol / Citronellal</TableCell>
                <TableCell className="font-mono text-xs font-bold text-emerald-600">86.50% (Min: 85%)</TableCell>
                <TableCell className="text-center text-xs font-semibold text-emerald-700">Lolos Ekspor</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
