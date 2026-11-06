'use client'

import { useTranslations } from 'next-intl'
import { Tag } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'
import { SectionCard } from '@/components/card/section-card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MOCK_LOT_ITEMS } from '@/data/scm-demo-data'

export default function SCMLotsPage() {
  const t = useTranslations('scm.demo.lots')

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Tag}
      />

      <SectionCard>
        <div className="bg-card relative rounded-md border shadow-xs overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.columns.code')}</TableHead>
                <TableHead>{t('table.columns.material')}</TableHead>
                <TableHead>{t('table.columns.type')}</TableHead>
                <TableHead className="text-right">{t('table.columns.quantity')}</TableHead>
                <TableHead>{t('table.columns.location')}</TableHead>
                <TableHead className="text-center">{t('table.columns.qc')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_LOT_ITEMS.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono font-semibold text-xs text-primary">
                    {item.code}
                  </TableCell>
                  <TableCell className="text-xs font-medium">{item.material}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {item.type === 'raw' ? 'Bahan Baku' : item.type === 'crude' ? 'Minyak Mentah' : 'Minyak Ekspor'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-right font-semibold">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.location}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={item.qcStatus === 'passed' ? 'default' : 'secondary'}
                      className="text-[10px]"
                    >
                      {item.qcStatus === 'passed' ? 'Lolos QC' : 'Karantina Lab'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  )
}
