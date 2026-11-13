'use client'

import { useRouter } from 'next/navigation'
import { Flame, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MOCK_DISTILLATION_ITEMS } from '@/data/scm-demo-data'

export default function SCMDistillationPage() {
  const t = useTranslations('scm.demo.distillation')
  const router = useRouter()

  const primaryActions = (
    <Button onClick={() => router.push('/scm/distillation/create')} className="h-8 cursor-pointer gap-1.5 text-xs font-medium">
      <Plus className="h-3.5 w-3.5" />
      <span>{t('actions.create')}</span>
    </Button>
  )

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={Flame} actions={primaryActions} />

      <SectionCard>
        <div className="bg-card relative overflow-x-auto rounded-md border shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.columns.code')}</TableHead>
                <TableHead>{t('table.columns.kettle')}</TableHead>
                <TableHead>{t('table.columns.inputLot')}</TableHead>
                <TableHead>{t('table.columns.duration')}</TableHead>
                <TableHead className="text-right">{t('table.columns.output')}</TableHead>
                <TableHead className="text-right">{t('table.columns.yield')}</TableHead>
                <TableHead>{t('table.columns.outputLot')}</TableHead>
                <TableHead className="text-center">{t('table.columns.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_DISTILLATION_ITEMS.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-primary font-mono text-xs font-semibold">{item.code}</TableCell>
                  <TableCell className="text-xs font-medium">{item.kettle}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{item.inputLot}</TableCell>
                  <TableCell className="text-xs">{item.duration}</TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold">{item.outputKg > 0 ? `${item.outputKg} Kg` : '-'}</TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-emerald-600">
                    {item.yieldPercent > 0 ? `${item.yieldPercent}%` : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{item.outputLot}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={item.status === 'completed' ? 'default' : 'outline'} className="text-[10px]">
                      {item.status === 'completed' ? 'Selesai Suling' : 'Proses Berjalan'}
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
