'use client'

import { useState } from 'react'
import { ArrowRight, Factory, FlaskConical, GitBranch, Package, Search, User, Wheat } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function SCMGenealogyPage() {
  const t = useTranslations('scm.demo.genealogy')
  const [selectedNode, setSelectedNode] = useState<string>('QC-20261106-001')

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={GitBranch} />

      {/* Search Header */}
      <Card className="border shadow-xs">
        <CardContent className="pt-6">
          <div className="flex max-w-md gap-2">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input defaultValue="EXP-DRUM-2026-042" placeholder={t('search')} className="h-9 pl-9 font-mono text-xs" />
            </div>
            <Button size="sm" className="h-9 cursor-pointer text-xs">
              Telusuri Silsilah
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Horizontal Genealogy Canvas */}
      <Card className="overflow-x-auto border shadow-xs">
        <CardHeader className="bg-muted/20 border-b">
          <CardTitle className="flex items-center justify-between text-sm font-semibold">
            <span>Alur Silsilah Batch: Minyak Nilam Super (Lot Ekspor EXP-DRUM-2026-042)</span>
            <Badge variant="default" className="text-[10px]">
              Terverifikasi Utuh (End-to-End)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex min-w-[900px] items-center gap-4 py-4">
            {/* Step 1: Farmer Origin */}
            <div
              onClick={() => setSelectedNode('Farmer')}
              className={`flex-1 cursor-pointer rounded-lg border p-4 transition-all ${
                selectedNode === 'Farmer' ? 'border-primary ring-primary/20 bg-primary/5 ring-2' : 'bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2 pb-2 text-xs font-semibold">
                <User className="text-primary h-4 w-4" />
                <span>Petani Binaan</span>
              </div>
              <p className="text-xs font-semibold">Bpk. Sukirman</p>
              <p className="text-muted-foreground text-[11px]">Kebun Lasem, Rembang</p>
              <p className="text-muted-foreground pt-1 font-mono text-[10px]">-6.7123, 111.4567</p>
            </div>

            <ArrowRight className="text-muted-foreground h-5 w-5 shrink-0" />

            {/* Step 2: Harvest Session */}
            <div
              onClick={() => setSelectedNode('Harvest')}
              className={`flex-1 cursor-pointer rounded-lg border p-4 transition-all ${
                selectedNode === 'Harvest' ? 'border-primary ring-primary/20 bg-primary/5 ring-2' : 'bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2 pb-2 text-xs font-semibold">
                <Wheat className="h-4 w-4 text-emerald-600" />
                <span>Sesi Panen</span>
              </div>
              <p className="text-primary font-mono text-xs font-semibold">HAR-20261106-001</p>
              <p className="text-muted-foreground text-[11px]">1,250 Kg Daun Basah</p>
              <p className="text-muted-foreground pt-1 font-mono text-[10px]">LOT-RAW-20261106-01</p>
            </div>

            <ArrowRight className="text-muted-foreground h-5 w-5 shrink-0" />

            {/* Step 3: Distillation */}
            <div
              onClick={() => setSelectedNode('Distillation')}
              className={`flex-1 cursor-pointer rounded-lg border p-4 transition-all ${
                selectedNode === 'Distillation' ? 'border-primary ring-primary/20 bg-primary/5 ring-2' : 'bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2 pb-2 text-xs font-semibold">
                <Factory className="h-4 w-4 text-blue-600" />
                <span>Penyulingan</span>
              </div>
              <p className="font-mono text-xs font-semibold">DST-JTG-001 (Ketel Uap)</p>
              <p className="text-muted-foreground text-[11px]">Output: 34.50 Kg Minyak</p>
              <p className="pt-1 font-mono text-[10px] font-bold text-emerald-600">Rendemen: 2.76%</p>
            </div>

            <ArrowRight className="text-muted-foreground h-5 w-5 shrink-0" />

            {/* Step 4: QC Lab */}
            <div
              onClick={() => setSelectedNode('QC')}
              className={`flex-1 cursor-pointer rounded-lg border p-4 transition-all ${
                selectedNode === 'QC' ? 'border-primary ring-primary/20 bg-primary/5 ring-2' : 'bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2 pb-2 text-xs font-semibold">
                <FlaskConical className="h-4 w-4 text-amber-600" />
                <span>Uji Lab QC</span>
              </div>
              <p className="font-mono text-xs font-semibold">QC-20261106-001</p>
              <p className="text-muted-foreground text-[11px]">PA: 32.4% (Min: 30%)</p>
              <p className="pt-1 font-mono text-[10px] font-bold text-emerald-600">COA-SBI-2026-042</p>
            </div>

            <ArrowRight className="text-muted-foreground h-5 w-5 shrink-0" />

            {/* Step 5: Export Drum */}
            <div
              onClick={() => setSelectedNode('Export')}
              className={`flex-1 cursor-pointer rounded-lg border p-4 transition-all ${
                selectedNode === 'Export' ? 'border-primary ring-primary/20 bg-primary/5 ring-2' : 'bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2 pb-2 text-xs font-semibold">
                <Package className="h-4 w-4 text-purple-600" />
                <span>Drum Ekspor</span>
              </div>
              <p className="text-primary font-mono text-xs font-semibold">EXP-DRUM-2026-042</p>
              <p className="text-muted-foreground text-[11px]">Drum 200L Epoxy</p>
              <p className="text-muted-foreground pt-1 font-mono text-[10px]">HS: 3301.29</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
