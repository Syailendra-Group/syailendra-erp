'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calculator, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SCMDistillationCreatePage() {
  const t = useTranslations('scm.demo.distillation')
  const tDemo = useTranslations('scm.demo')
  const router = useRouter()

  const [biomass, setBiomass] = useState<number>(1250)
  const [oil, setOil] = useState<number>(34.5)

  // Real-time Yield calculation
  const calculatedYield = biomass > 0 ? ((oil / biomass) * 100).toFixed(2) : '0.00'

  const handleSave = () => {
    toast.success(tDemo('toasts.distillationSaved'))
    router.push('/scm/distillation')
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex items-center justify-between border-b pt-2 pb-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => router.push('/scm/distillation')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Catat Hasil Penyulingan</h1>
            <p className="text-muted-foreground text-xs">Catat input daun masuk, operasional ketel, dan hasil timbang minyak mentah.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" className="h-8 cursor-pointer text-xs" onClick={() => router.push('/scm/distillation')}>
            Batal
          </Button>
          <Button type="button" size="sm" className="h-8 cursor-pointer gap-1.5 text-xs font-medium" onClick={handleSave}>
            <Save className="h-3.5 w-3.5" />
            <span>Simpan Hasil Suling</span>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Real-time Yield Calculator Card */}
        <Card className="border-emerald-200 bg-emerald-50/40 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-emerald-800">
              <Calculator className="h-4 w-4" />
              <CardTitle className="text-sm font-semibold">{t('calculator.title')}</CardTitle>
            </div>
            <p className="text-muted-foreground text-xs">{t('calculator.formula')}</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-3xl font-extrabold text-emerald-700">{calculatedYield}%</span>
              <span className="text-xs font-medium text-emerald-800">
                {Number(calculatedYield) >= 2.5 ? '🌟 Rendemen Sangat Optimal (Di atas target standar 2.50%)' : '⚠️ Rendemen di bawah target standar'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Section: Kettle & Input */}
        <Card className="border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Unit Ketel & Input Biomassa</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Unit Ketel Penyulingan</Label>
              <Input defaultValue="DST-JTG-001 (Ketel Uap 1 Ton Stainless)" className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Lot Bahan Baku Input</Label>
              <Input defaultValue="LOT-RAW-20261106-01 (Nilam Jawa - 1,250 Kg)" className="h-8 font-mono text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Berat Daun Masuk (Biomassa Kg)</Label>
              <Input type="number" value={biomass} onChange={(e) => setBiomass(Number(e.target.value))} className="h-8 font-mono text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Durasi Penyulingan (Jam)</Label>
              <Input defaultValue="8.5" className="h-8 font-mono text-xs" />
            </div>
          </CardContent>
        </Card>

        {/* Section: Output Oil */}
        <Card className="border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Hasil Timbang Minyak Mentah (Output)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Berat Minyak Dihasilkan (Kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={oil}
                onChange={(e) => setOil(Number(e.target.value))}
                className="text-primary h-8 font-mono text-xs font-bold"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nomor Lot Minyak Terbit</Label>
              <Input disabled defaultValue="LOT-OIL-20261106-05" className="bg-muted/40 text-primary h-8 font-mono text-xs font-semibold" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
