'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PILLAR_ORDER } from '@/data/pillar-catalog'

import type { ModuleTab } from '@/stores/nav-store'
import type { CompanyRecord } from '@/types/others/company'
import type { ReactElement } from 'react'

interface MenuSummaryCardsProps {
  companies: CompanyRecord[]
  ownerMap: Record<ModuleTab, number>
}

export function MenuSummaryCards({ companies, ownerMap }: MenuSummaryCardsProps): ReactElement {
  const t = useTranslations('others.menus')

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {companies.map((c) => {
        const ownedPillars = PILLAR_ORDER.filter((p) => ownerMap[p] === c.id)
        return (
          <Card key={c.id} className="shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="default" className="text-[11px] font-bold">
                  {c.short_name}
                </Badge>
                <span className="text-muted-foreground text-[11px] font-medium">
                  {ownedPillars.length} {t('pillarsCount')}
                </span>
              </div>
              <CardTitle className="truncate pt-1 text-xs font-semibold">{c.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {ownedPillars.map((id) => (
                  <Badge key={id} variant="secondary" className="text-[10px] uppercase">
                    {id}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
