'use client'

import { KeyRound, Shield, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import type { ReactElement } from 'react'

export function RolesFeature(): ReactElement {
  const t = useTranslations('others.roles')

  const roles = [
    {
      id: 'super_admin',
      name: t('rolesList.adminName'),
      description: t('rolesList.adminDesc'),
      usersCount: 2,
      access: ['ALL', 'SYSTEM', 'ERP_OPS', 'AUDIT']
    },
    {
      id: 'ops_manager',
      name: t('rolesList.managerName'),
      description: t('rolesList.managerDesc'),
      usersCount: 4,
      access: ['TRACE', 'WMS', 'CRM', 'REPORTS']
    },
    {
      id: 'field_staff',
      name: t('rolesList.staffName'),
      description: t('rolesList.staffDesc'),
      usersCount: 18,
      access: ['GRN_INBOUND', 'WEIGHING', 'BARCODE']
    },
    {
      id: 'partner_farmer',
      name: t('rolesList.farmerName'),
      description: t('rolesList.farmerDesc'),
      usersCount: 8,
      access: ['PORTAL_VIEW_HARVEST', 'PROVENANCE_BADGE']
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={Shield} />

      <Card className="shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base">{t('matrixTitle')}</CardTitle>
          <CardDescription className="text-xs">{t('matrixSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold">{t('matrixTitle')}</TableHead>
                <TableHead className="text-xs font-semibold">{t('accessEntitlements')}</TableHead>
                <TableHead className="text-center text-xs font-semibold">{t('matrixSubtitle')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="text-primary size-4 shrink-0" />
                      <div>
                        <p className="text-xs font-bold sm:text-sm">{r.name}</p>
                        <p className="text-muted-foreground text-[11px]">{r.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.access.map((acc) => (
                        <Badge key={acc} variant="secondary" className="font-mono text-[10px]">
                          {acc}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <Badge variant="outline" className="font-mono text-xs">
                      {r.usersCount} Pengguna
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-muted/20 shadow-xs">
        <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs">
            <KeyRound className="text-primary size-4" />
            <span className="font-medium">{t('accessEntitlements')}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <Badge variant="outline">{t('modules.traceability')}</Badge>
            <Badge variant="outline">{t('modules.wms')}</Badge>
            <Badge variant="outline">{t('modules.crm')}</Badge>
            <Badge variant="outline">{t('modules.hris')}</Badge>
            <Badge variant="outline">{t('modules.admin')}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
