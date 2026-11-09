'use client'

import { Building2, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PrimaryAction } from '@/components/button/primary-action'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import type { ReactElement } from 'react'

export function PartnersFeature(): ReactElement {
  const t = useTranslations('others.partners')

  const contacts = [
    {
      id: 1,
      name: 'Koperasi Tani Makmur Sumbing',
      category: 'Petani Binaan',
      phone: '+62 812 8899 0011',
      email: 'makmur@syailendrafarm.id',
      city: 'Wonosobo'
    },
    {
      id: 2,
      name: 'PT. Java Aroma Nusantara',
      category: 'Penyuling Mitra',
      phone: '+62 811 4455 6677',
      email: 'aroma@javadistill.com',
      city: 'Temanggung'
    },
    {
      id: 3,
      name: 'Le Palais des Parfums SAS',
      category: 'Buyer B2B Global',
      phone: '+33 1 42 68 55 00',
      email: 'procurement@lepalais.fr',
      city: 'Paris, France'
    },
    { id: 4, name: 'CV. Agro Sumber Mas', category: 'Pemasok Biomassa', phone: '+62 813 2233 4455', email: 'agrosumber@atsiri.id', city: 'Batang' }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Users}
        actions={<PrimaryAction onClick={() => {}} label={t('primaryAction')} />}
      />

      <Card className="shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base">{t('subtitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold">{t('table.name')}</TableHead>
                <TableHead className="text-xs font-semibold">{t('table.category')}</TableHead>
                <TableHead className="text-xs font-semibold">{t('table.phone')}</TableHead>
                <TableHead className="text-xs font-semibold">{t('table.email')}</TableHead>
                <TableHead className="text-xs font-semibold">{t('table.city')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs font-semibold sm:text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="text-primary size-4 shrink-0" />
                      <span>{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant="info">{c.category}</StatusBadge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{c.phone}</TableCell>
                  <TableCell className="font-mono text-xs">{c.email}</TableCell>
                  <TableCell className="text-xs font-medium">{c.city}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
