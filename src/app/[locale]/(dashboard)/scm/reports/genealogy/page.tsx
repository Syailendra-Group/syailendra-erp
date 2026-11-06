'use client'

import { useTranslations } from 'next-intl'
import { Download, FileText, Printer } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { toast } from 'sonner'

export default function SCMReportGenealogyPage() {
  const t = useTranslations('scm.demo.reports')

  const handleExport = (type: string) => {
    toast.success(`Dokumen Paspor Komoditas SCM berhasil diekspor (${type})`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Paspor Ketelusuran Ekspor (Genealogy Passport)"
        description="Dokumen audit resmi silsilah lot hulu-ke-hilir untuk otoritas kepabeanan dan pembeli internasional"
        icon={FileText}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs cursor-pointer"
              onClick={() => handleExport('Excel')}
            >
              <Download className="h-3.5 w-3.5" />
              <span>{t('exportExcel')}</span>
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs cursor-pointer font-medium"
              onClick={() => handleExport('PDF')}
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{t('exportPDF')}</span>
            </Button>
          </div>
        }
      />

      {/* Printable A4 Certificate Mockup */}
      <Card className="shadow-xs border max-w-4xl mx-auto bg-white text-black p-8 font-sans">
        <div className="border-b-2 border-black pb-4 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black tracking-wide uppercase">PT SYAILENDRA BUMI INVESTAMA</h1>
            <p className="text-xs text-zinc-600 font-medium">Head Office: Menara Rajawali Lt. 12, Mega Kuningan, Jakarta Selatan</p>
            <p className="text-xs text-zinc-600 font-medium">Processing Facility: Kawasan Agroindustri Atsiri Lasem, Rembang, Jawa Tengah</p>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs font-bold block">DOC-ID: PASSPORT-2026-042</span>
            <span className="text-[10px] text-zinc-500">ISO 9001:2015 & HACCP Certified</span>
          </div>
        </div>

        <div className="py-6 text-center space-y-1">
          <h2 className="text-lg font-black tracking-widest uppercase">CERTIFICATE OF ORIGIN & TRACEABILITY PASSPORT</h2>
          <p className="text-xs italic text-zinc-700">Official End-to-End Supply Chain Lineage Verification</p>
        </div>

        <div className="space-y-6 text-xs">
          <div className="grid grid-cols-2 gap-4 border p-3 rounded bg-zinc-50">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase">Export Lot Number</p>
              <p className="font-mono font-bold text-sm">EXP-DRUM-2026-042</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase">Commodity / Botanical Name</p>
              <p className="font-bold text-sm">Indonesian Patchouli Oil (Pogostemon cablin Benth.)</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold border-b pb-1 mb-2">1. Upstream Plantation & Harvest Lineage</h3>
            <p className="text-[11px] text-zinc-600">
              Biomass harvested from Binaan Farmers in Lasem & Garut. Verified total leaf intake: 3,650 Kg net weight.
            </p>
          </div>

          <div>
            <h3 className="font-bold border-b pb-1 mb-2">2. Distillation & Extraction Record</h3>
            <p className="text-[11px] text-zinc-600">
              Processed in Steam Kettle DST-JTG-001 & DST-JTG-002. Average yield: 2.76%. Quarantined under batch LOT-OIL-20261106-01.
            </p>
          </div>

          <div>
            <h3 className="font-bold border-b pb-1 mb-2">3. Physicochemical Quality & GC-MS Compliance</h3>
            <p className="text-[11px] text-zinc-600">
              Relative Density: 0.965 | Refractive Index: 1.508 | Patchouli Alcohol: 32.4% (Passes ISO 4724 minimum 30%).
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
