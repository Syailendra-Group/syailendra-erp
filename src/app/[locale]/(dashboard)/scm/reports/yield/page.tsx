'use client'

import { LineChart } from 'lucide-react'

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

export default function SCMReportYieldPage() {

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Evaluasi Efisiensi Rendemen Ketel"
        description="Analisis komparatif rendemen minyak atsiri per ketel, jenis bahan bakar, dan varietas komoditas"
        icon={LineChart}
      />

      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-xs border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Tabel Komparasi Efisiensi Ketel Penyulingan (Bulan Ini)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Ketel</TableHead>
                  <TableHead>Kapasitas</TableHead>
                  <TableHead>Tipe Ketel</TableHead>
                  <TableHead className="text-right">Biomassa Masuk</TableHead>
                  <TableHead className="text-right">Minyak Diperoleh</TableHead>
                  <TableHead className="text-right">Rendemen Rata-rata</TableHead>
                  <TableHead className="text-center">Efisiensi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-xs font-bold text-primary">DST-JTG-001</TableCell>
                  <TableCell className="text-xs">1,000 Kg</TableCell>
                  <TableCell className="text-xs">Uap Langsung (Stainless 316)</TableCell>
                  <TableCell className="font-mono text-xs text-right">18,500 Kg</TableCell>
                  <TableCell className="font-mono text-xs text-right">510.60 Kg</TableCell>
                  <TableCell className="font-mono text-xs text-right font-bold text-emerald-600">2.76%</TableCell>
                  <TableCell className="text-center text-xs font-semibold text-emerald-700">Tinggi (A)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs font-bold text-primary">DST-JTG-002</TableCell>
                  <TableCell className="text-xs">2,000 Kg</TableCell>
                  <TableCell className="text-xs">Uap Langsung (Stainless 304)</TableCell>
                  <TableCell className="font-mono text-xs text-right">24,200 Kg</TableCell>
                  <TableCell className="font-mono text-xs text-right">687.28 Kg</TableCell>
                  <TableCell className="font-mono text-xs text-right font-bold text-emerald-600">2.84%</TableCell>
                  <TableCell className="text-center text-xs font-semibold text-emerald-700">Tinggi (A+)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs font-bold text-primary">DST-JBR-001</TableCell>
                  <TableCell className="text-xs">500 Kg</TableCell>
                  <TableCell className="text-xs">Kukus (Steam-Water)</TableCell>
                  <TableCell className="font-mono text-xs text-right">5,550 Kg</TableCell>
                  <TableCell className="font-mono text-xs text-right">82.52 Kg</TableCell>
                  <TableCell className="font-mono text-xs text-right font-bold text-amber-600">1.48%</TableCell>
                  <TableCell className="text-center text-xs font-semibold text-amber-700">Sedang (B)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
