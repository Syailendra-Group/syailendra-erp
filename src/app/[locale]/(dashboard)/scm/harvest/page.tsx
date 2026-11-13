'use client'

import { useRouter } from 'next/navigation'
import { Plus, Wheat } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MOCK_HARVEST_ITEMS } from '@/data/scm-demo-data'

export default function SCMHarvestPage() {
  const t = useTranslations('scm.demo.harvest')
  const router = useRouter()

  const primaryActions = (
    <Button onClick={() => router.push('/scm/harvest/create')} className="h-8 cursor-pointer gap-1.5 text-xs font-medium">
      <Plus className="h-3.5 w-3.5" />
      <span>{t('actions.create')}</span>
    </Button>
  )

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={Wheat} actions={primaryActions} />

      <SectionCard>
        <div className="bg-card relative overflow-x-auto rounded-md border shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.columns.code')}</TableHead>
                <TableHead>{t('table.columns.date')}</TableHead>
                <TableHead>{t('table.columns.farmer')}</TableHead>
                <TableHead>{t('table.columns.commodity')}</TableHead>
                <TableHead>{t('table.columns.location')}</TableHead>
                <TableHead className="text-right">{t('table.columns.weight')}</TableHead>
                <TableHead>{t('table.columns.moisture')}</TableHead>
                <TableHead>{t('table.columns.lot')}</TableHead>
                <TableHead className="text-center">{t('table.columns.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_HARVEST_ITEMS.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-primary font-mono text-xs font-semibold">{item.code}</TableCell>
                  <TableCell className="text-xs">{item.date}</TableCell>
                  <TableCell className="text-xs font-medium">{item.farmer}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{item.commodity}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{item.location}</TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold">{item.weight.toLocaleString('id-ID')} Kg</TableCell>
                  <TableCell className="font-mono text-xs">{item.moisture}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{item.lot}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={item.status === 'ready' ? 'default' : 'outline'} className="text-[10px]">
                      {item.status === 'ready' ? t('table.status.ready') : t('table.status.received')}
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
