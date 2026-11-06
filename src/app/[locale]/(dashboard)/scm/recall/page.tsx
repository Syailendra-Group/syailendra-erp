'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { RotateCcw, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/page-header'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function SCMRecallPage() {
  const t = useTranslations('scm.demo.recall')
  const [hasRun, setHasRun] = useState(true)

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={RotateCcw}
      />

      <Card className="shadow-xs border">
        <CardContent className="pt-6">
          <div className="flex gap-2 max-w-lg">
            <Input
              defaultValue="EXP-DRUM-2026-042"
              placeholder={t('search')}
              className="h-9 font-mono text-xs"
            />
            <Button size="sm" onClick={() => setHasRun(true)} className="h-9 text-xs cursor-pointer">
              {t('run')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasRun && (
        <div className="space-y-6">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <div>
                <p className="text-xs font-semibold text-emerald-900">{t('speed')}</p>
                <p className="text-[11px] text-emerald-700">
                  Target audit ISO 22000 terpenuhi: 100% pohon asal hulu terlacak dalam hitungan detik.
                </p>
              </div>
            </div>
          </div>

          <Card className="shadow-xs border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">{t('summary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode Panen</TableHead>
                    <TableHead>Petani Pemasok</TableHead>
                    <TableHead>Komoditas</TableHead>
                    <TableHead>Ketel Distilasi</TableHead>
                    <TableHead className="text-right">Kontribusi Bobot</TableHead>
                    <TableHead>COA Lab</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs font-semibold text-primary">HAR-20261106-001</TableCell>
                    <TableCell className="text-xs font-medium">Bpk. Sukirman (Lasem)</TableCell>
                    <TableCell className="text-xs">Nilam Jawa Super</TableCell>
                    <TableCell className="font-mono text-xs">DST-JTG-001</TableCell>
                    <TableCell className="font-mono text-xs text-right font-bold">120.00 Kg (60%)</TableCell>
                    <TableCell className="font-mono text-xs text-emerald-600 font-semibold">COA-SBI-042 (PASS)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs font-semibold text-primary">HAR-20261105-004</TableCell>
                    <TableCell className="text-xs font-medium">Koperasi Tani Atsiri Manunggal</TableCell>
                    <TableCell className="text-xs">Nilam Jawa Super</TableCell>
                    <TableCell className="font-mono text-xs">DST-JTG-002</TableCell>
                    <TableCell className="font-mono text-xs text-right font-bold">80.00 Kg (40%)</TableCell>
                    <TableCell className="font-mono text-xs text-emerald-600 font-semibold">COA-SBI-042 (PASS)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
