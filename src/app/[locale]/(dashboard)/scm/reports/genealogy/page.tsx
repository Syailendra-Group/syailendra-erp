'use client'

import { Download, FileText, Printer } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function SCMReportGenealogyPage() {
  const t = useTranslations('scm.demo.reports')
  const tDemo = useTranslations('scm.demo')

  const handleExport = (type: string) => {
    toast.success(tDemo('toasts.genealogyExported', { type }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Paspor Ketelusuran Ekspor (Genealogy Passport)"
        description="Dokumen audit resmi silsilah lot hulu-ke-hilir untuk otoritas kepabeanan dan pembeli internasional"
        icon={FileText}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="cursor-pointer gap-1.5 text-xs" onClick={() => handleExport('Excel')}>
              <Download className="h-3.5 w-3.5" />
              <span>{t('exportExcel')}</span>
            </Button>
            <Button className="cursor-pointer gap-1.5 text-xs font-medium" onClick={() => handleExport('PDF')}>
              <Printer className="h-3.5 w-3.5" />
              <span>{t('exportPDF')}</span>
            </Button>
          </div>
        }
      />

      {/* Printable A4 Certificate Mockup */}
      <Card className="mx-auto max-w-4xl border bg-white p-8 font-sans text-black shadow-xs">
        <div className="flex items-start justify-between border-b-2 border-black pb-4">
          <div>
            <h1 className="text-xl font-black tracking-wide uppercase">PT SYAILENDRA BUMI INVESTAMA</h1>
            <p className="text-xs font-medium text-zinc-600">Head Office: Menara Rajawali Lt. 12, Mega Kuningan, Jakarta Selatan</p>
            <p className="text-xs font-medium text-zinc-600">Processing Facility: Kawasan Agroindustri Atsiri Lasem, Rembang, Jawa Tengah</p>
          </div>
          <div className="text-right">
            <span className="block font-mono text-xs font-bold">DOC-ID: PASSPORT-2026-042</span>
            <span className="text-[10px] text-zinc-500">ISO 9001:2015 & HACCP Certified</span>
          </div>
        </div>

        <div className="space-y-1 py-6 text-center">
          <h2 className="text-lg font-black tracking-widest uppercase">CERTIFICATE OF ORIGIN & TRACEABILITY PASSPORT</h2>
          <p className="text-xs text-zinc-700 italic">Official End-to-End Supply Chain Lineage Verification</p>
        </div>

        <div className="space-y-6 text-xs">
          <div className="grid grid-cols-2 gap-4 rounded border bg-zinc-50 p-3">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase">Export Lot Number</p>
              <p className="font-mono text-sm font-bold">EXP-DRUM-2026-042</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase">Commodity / Botanical Name</p>
              <p className="text-sm font-bold">Indonesian Patchouli Oil (Pogostemon cablin Benth.)</p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 border-b pb-1 font-bold">1. Upstream Plantation & Harvest Lineage</h3>
            <p className="text-[11px] text-zinc-600">
              Biomass harvested from Binaan Farmers in Lasem & Garut. Verified total leaf intake: 3,650 Kg net weight.
            </p>
          </div>

          <div>
            <h3 className="mb-2 border-b pb-1 font-bold">2. Distillation & Extraction Record</h3>
            <p className="text-[11px] text-zinc-600">
              Processed in Steam Kettle DST-JTG-001 & DST-JTG-002. Average yield: 2.76%. Quarantined under batch LOT-OIL-20261106-01.
            </p>
          </div>

          <div>
            <h3 className="mb-2 border-b pb-1 font-bold">3. Physicochemical Quality & GC-MS Compliance</h3>
            <p className="text-[11px] text-zinc-600">
              Relative Density: 0.965 | Refractive Index: 1.508 | Patchouli Alcohol: 32.4% (Passes ISO 4724 minimum 30%).
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
