'use client'

import { FlaskConical } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MOCK_QC_ITEMS } from '@/data/scm-demo-data'

export default function SCMQCPage() {
  const t = useTranslations('scm.demo.qc')
  const tCommon = useTranslations('common')

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={FlaskConical} />

      <SectionCard>
        <div className="bg-card relative overflow-x-auto rounded-md border shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.columns.code')}</TableHead>
                <TableHead>{t('table.columns.lot')}</TableHead>
                <TableHead>{t('table.columns.commodity')}</TableHead>
                <TableHead>{t('table.columns.density')}</TableHead>
                <TableHead>{t('table.columns.refractive')}</TableHead>
                <TableHead>{t('table.columns.marker')}</TableHead>
                <TableHead className="text-center">{t('table.columns.result')}</TableHead>
                <TableHead>{t('table.columns.coa')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_QC_ITEMS.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-primary font-mono text-xs font-semibold">{item.code}</TableCell>
                  <TableCell className="font-mono text-xs">{item.lot}</TableCell>
                  <TableCell className="text-xs font-medium">{item.commodity}</TableCell>
                  <TableCell className="font-mono text-xs">{item.density}</TableCell>
                  <TableCell className="font-mono text-xs">{item.refractive}</TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-emerald-600">{item.marker}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={item.result === 'passed' ? 'default' : 'secondary'} className="text-[10px]">
                      {item.result === 'passed' ? tCommon('status.passed') : tCommon('status.quarantine')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{item.coa}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  )
}
