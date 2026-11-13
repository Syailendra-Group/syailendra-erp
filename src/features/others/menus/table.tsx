'use client'

import { Building2, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PILLAR_ICONS, PILLAR_ORDER } from '@/data/pillar-catalog'
import { cn } from '@/lib/utils'

import type { ModuleTab } from '@/stores/nav-store'
import type { CompanyRecord } from '@/types/others/company'
import type { ReactElement } from 'react'

interface MenuAllocationTableProps {
  companies: CompanyRecord[]
  ownerMap: Record<ModuleTab, number>
  onAssign: (pillar: ModuleTab, companyId: number) => void
}

export function MenuAllocationTable({ companies, ownerMap, onAssign }: MenuAllocationTableProps): ReactElement {
  const t = useTranslations('others.menus')
  const tCompany = useTranslations('others.company')

  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <ShieldCheck className="text-primary size-4" />
          <span>{t('matrixTitle')}</span>
        </CardTitle>
        <CardDescription className="text-xs">{t('matrixSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-80 text-xs font-semibold">{t('colPillar')}</TableHead>
                {companies.map((c) => (
                  <TableHead key={c.id} className="text-center text-xs font-semibold">
                    <div className="flex flex-col items-center gap-0.5 py-1">
                      <span className="font-bold">{c.short_name}</span>
                      <span className="text-muted-foreground max-w-32 truncate text-[10px] font-normal">{c.name}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {PILLAR_ORDER.map((id) => {
                const Icon = PILLAR_ICONS[id]
                return (
                  <TableRow key={id} data-pillar={id}>
                    <TableCell className="align-middle">
                      <div className="flex items-start gap-2.5 py-1">
                        <div className="bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border">
                          <Icon className="size-4" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold">{tCompany(`pillarLabels.${id}`)}</div>
                          <p className="text-muted-foreground line-clamp-1 text-[11px]">{tCompany(`pillarDesc.${id}`)}</p>
                        </div>
                      </div>
                    </TableCell>

                    {companies.map((c) => {
                      const isSelected = ownerMap[id] === c.id
                      return (
                        <TableCell key={c.id} className="text-center align-middle">
                          <Button
                            type="button"
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            aria-pressed={isSelected}
                            data-company-id={c.id}
                            onClick={() => onAssign(id, c.id)}
                            className={cn(
                              'h-8 min-w-24 gap-1.5 text-xs transition-all',
                              isSelected ? 'font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            {isSelected ? <CheckCircle2 className="size-3.5" /> : <Building2 className="size-3 opacity-50" />}
                            <span>{isSelected ? c.short_name : t('assignBtn')}</span>
                          </Button>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
