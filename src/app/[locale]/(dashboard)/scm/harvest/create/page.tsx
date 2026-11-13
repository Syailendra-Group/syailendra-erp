'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SCMHarvestCreatePage() {
  const t = useTranslations('scm.demo.harvest')
  const tDemo = useTranslations('scm.demo')
  const router = useRouter()

  const handleSave = () => {
    toast.success(tDemo('toasts.harvestRecorded'))
    router.push('/scm/harvest')
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Sticky Header Actions */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex items-center justify-between border-b pt-2 pb-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => router.push('/scm/harvest')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{t('form.createTitle')}</h1>
            <p className="text-muted-foreground text-xs">{t('form.createDescription')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" className="cursor-pointer text-xs" onClick={() => router.push('/scm/harvest')}>
            Batal
          </Button>
          <Button type="button" className="cursor-pointer gap-1.5 text-xs font-medium" onClick={handleSave}>
            <Save className="h-3.5 w-3.5" />
            <span>Simpan Sesi Panen</span>
          </Button>
        </div>
      </div>

      {/* Semantic Sections (< 250 lines) */}
      <div className="space-y-6">
        {/* Section 1: Identity */}
        <Card className="border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">{t('form.sections.identity')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">{t('form.fields.code')}</Label>
              <Input disabled defaultValue="HAR-20261106-005" className="bg-muted/40 font-mono text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('form.fields.commodity')}</Label>
              <Input defaultValue="Nilam Jawa (Pogostemon cablin) - SBI-PKD-CDW-042" className="text-xs" />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Origin */}
        <Card className="border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">{t('form.sections.origin')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">{t('form.fields.farmer')}</Label>
              <Input defaultValue="Bpk. Sukirman (Kelompok Tani Rembang)" className="text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('form.fields.gps')}</Label>
              <Input defaultValue="-6.712345, 111.456789" className="font-mono text-xs" />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Weight & Quality */}
        <Card className="border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">{t('form.sections.weight')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs">{t('form.fields.weight')}</Label>
              <Input type="number" defaultValue="1500" className="font-mono text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('form.fields.moisture')}</Label>
              <Input defaultValue="14.5%" className="font-mono text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('form.fields.lot')}</Label>
              <Input disabled defaultValue="LOT-RAW-20261106-05" className="bg-muted/40 text-primary font-mono text-xs font-semibold" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
