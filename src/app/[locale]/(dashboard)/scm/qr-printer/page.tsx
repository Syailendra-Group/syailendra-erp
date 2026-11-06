'use client'

import { useTranslations } from 'next-intl'
import { Printer, QrCode } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { toast } from 'sonner'

export default function SCMQRPrinterPage() {
  const t = useTranslations('scm.demo.qrPrinter')

  const handlePrint = () => {
    toast.success('Perintah Cetak Label Terkirim ke Printer Thermal (Demo Mock)')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={QrCode}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Settings */}
        <Card className="shadow-xs border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Pengaturan Format Label</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Pilih Tipe & Ukuran Label</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-md border p-2.5 text-xs bg-primary/5 border-primary">
                  <input type="radio" name="label_size" defaultChecked className="accent-primary" />
                  <span className="font-medium">{t('options.drum')}</span>
                </div>
                <div className="flex items-center gap-2 rounded-md border p-2.5 text-xs">
                  <input type="radio" name="label_size" className="accent-primary" />
                  <span>{t('options.medium')}</span>
                </div>
                <div className="flex items-center gap-2 rounded-md border p-2.5 text-xs">
                  <input type="radio" name="label_size" className="accent-primary" />
                  <span>{t('options.small')}</span>
                </div>
              </div>
            </div>

            <Button onClick={handlePrint} className="w-full gap-2 text-xs font-semibold cursor-pointer">
              <Printer className="h-4 w-4" />
              <span>{t('print')}</span>
            </Button>
          </CardContent>
        </Card>

        {/* Right: Printable Industrial Label Mockup */}
        <Card className="lg:col-span-2 shadow-xs border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Pratinjau Label Standar Ekspor</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <div className="w-full max-w-md rounded-md border-2 border-black p-6 bg-white text-black space-y-4 font-sans">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div>
                  <h2 className="text-base font-black tracking-wider uppercase">PT SYAILENDRA BUMI INVESTAMA</h2>
                  <p className="text-[10px] text-zinc-600">DDistillers Essential Oil Processing Unit</p>
                </div>
                <QrCode className="h-12 w-12 text-black" />
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Product Name / Commodity</p>
                <p className="text-base font-black">INDONESIAN PATCHOULI OIL SUPER</p>
                <p className="text-[11px] italic text-zinc-700">Pogostemon cablin Benth.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-b border-black py-2 text-xs">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block">Batch / Lot No.</span>
                  <span className="font-mono font-bold">EXP-DRUM-2026-042</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block">Net Weight</span>
                  <span className="font-mono font-bold">200.00 KG NET</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block">HS Code / BTKI</span>
                  <span className="font-mono font-bold">3301.29.90</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block">COA Certificate No.</span>
                  <span className="font-mono font-bold">COA-SBI-2026-042</span>
                </div>
              </div>

              <div className="text-[9px] text-zinc-500 flex justify-between items-center">
                <span>Origin: Central Java, Indonesia</span>
                <span className="font-mono">Packed: 06-NOV-2026</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
