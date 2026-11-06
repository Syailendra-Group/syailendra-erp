'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  ArrowRight,
  Factory,
  FlaskConical,
  GitBranch,
  Package,
  Search,
  User,
  Wheat,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/page-header'

export default function SCMGenealogyPage() {
  const t = useTranslations('scm.demo.genealogy')
  const [selectedNode, setSelectedNode] = useState<string>('QC-20261106-001')

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={GitBranch}
      />

      {/* Search Header */}
      <Card className="shadow-xs border">
        <CardContent className="pt-6">
          <div className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
              <Input
                defaultValue="EXP-DRUM-2026-042"
                placeholder={t('search')}
                className="pl-9 h-9 font-mono text-xs"
              />
            </div>
            <Button size="sm" className="h-9 text-xs cursor-pointer">
              Telusuri Silsilah
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Horizontal Genealogy Canvas */}
      <Card className="shadow-xs border overflow-x-auto">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span>Alur Silsilah Batch: Minyak Nilam Super (Lot Ekspor EXP-DRUM-2026-042)</span>
            <Badge variant="default" className="text-[10px]">
              Terverifikasi Utuh (End-to-End)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 min-w-[900px] py-4">
            {/* Step 1: Farmer Origin */}
            <div
              onClick={() => setSelectedNode('Farmer')}
              className={`flex-1 rounded-lg border p-4 cursor-pointer transition-all ${
                selectedNode === 'Farmer' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2 pb-2 text-xs font-semibold">
                <User className="h-4 w-4 text-primary" />
                <span>Petani Binaan</span>
              </div>
              <p className="font-semibold text-xs">Bpk. Sukirman</p>
              <p className="text-muted-foreground text-[11px]">Kebun Lasem, Rembang</p>
              <p className="font-mono text-[10px] text-muted-foreground pt-1">-6.7123, 111.4567</p>
            </div>

            <ArrowRight className="text-muted-foreground h-5 w-5 shrink-0" />

            {/* Step 2: Harvest Session */}
            <div
              onClick={() => setSelectedNode('Harvest')}
              className={`flex-1 rounded-lg border p-4 cursor-pointer transition-all ${
                selectedNode === 'Harvest' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2 pb-2 text-xs font-semibold">
                <Wheat className="h-4 w-4 text-emerald-600" />
                <span>Sesi Panen</span>
              </div>
              <p className="font-mono font-semibold text-xs text-primary">HAR-20261106-001</p>
              <p className="text-muted-foreground text-[11px]">1,250 Kg Daun Basah</p>
              <p className="font-mono text-[10px] text-muted-foreground pt-1">LOT-RAW-20261106-01</p>
            </div>

            <ArrowRight className="text-muted-foreground h-5 w-5 shrink-0" />

            {/* Step 3: Distillation */}
            <div
              onClick={() => setSelectedNode('Distillation')}
              className={`flex-1 rounded-lg border p-4 cursor-pointer transition-all ${
                selectedNode === 'Distillation' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2 pb-2 text-xs font-semibold">
                <Factory className="h-4 w-4 text-blue-600" />
                <span>Penyulingan</span>
              </div>
              <p className="font-mono font-semibold text-xs">DST-JTG-001 (Ketel Uap)</p>
              <p className="text-muted-foreground text-[11px]">Output: 34.50 Kg Minyak</p>
              <p className="font-mono text-[10px] text-emerald-600 font-bold pt-1">Rendemen: 2.76%</p>
            </div>

            <ArrowRight className="text-muted-foreground h-5 w-5 shrink-0" />

            {/* Step 4: QC Lab */}
            <div
              onClick={() => setSelectedNode('QC')}
              className={`flex-1 rounded-lg border p-4 cursor-pointer transition-all ${
                selectedNode === 'QC' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2 pb-2 text-xs font-semibold">
                <FlaskConical className="h-4 w-4 text-amber-600" />
                <span>Uji Lab QC</span>
              </div>
              <p className="font-mono font-semibold text-xs">QC-20261106-001</p>
              <p className="text-muted-foreground text-[11px]">PA: 32.4% (Min: 30%)</p>
              <p className="font-mono text-[10px] text-emerald-600 font-bold pt-1">COA-SBI-2026-042</p>
            </div>

            <ArrowRight className="text-muted-foreground h-5 w-5 shrink-0" />

            {/* Step 5: Export Drum */}
            <div
              onClick={() => setSelectedNode('Export')}
              className={`flex-1 rounded-lg border p-4 cursor-pointer transition-all ${
                selectedNode === 'Export' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2 pb-2 text-xs font-semibold">
                <Package className="h-4 w-4 text-purple-600" />
                <span>Drum Ekspor</span>
              </div>
              <p className="font-mono font-semibold text-xs text-primary">EXP-DRUM-2026-042</p>
              <p className="text-muted-foreground text-[11px]">Drum 200L Epoxy</p>
              <p className="font-mono text-[10px] text-muted-foreground pt-1">HS: 3301.29</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
