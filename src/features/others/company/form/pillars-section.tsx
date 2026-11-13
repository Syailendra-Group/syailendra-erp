'use client'

import { ArrowRight, Sliders } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PILLAR_ICONS } from '@/data/pillar-catalog'
import { Link } from '@/i18n/navigation'

import type { CompanyFormValues } from '@/schemas/others/company-schema'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

interface PillarsSectionProps {
  form: UseFormReturn<CompanyFormValues>
  t: (key: string) => string
}

export function PillarsSection({ form, t }: PillarsSectionProps): ReactElement {
  const enabledPillars = form.watch('enabled_pillars') || []

  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="text-sm sm:text-base">{t('sections.pillars.title')}</CardTitle>
            <CardDescription className="text-xs">{t('sections.pillars.subtitle')}</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
            <Link href="/others/menus">
              <Sliders className="size-3.5" />
              <span>{t('managePillarAllocation')}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {enabledPillars.length === 0 ? (
          <p className="text-muted-foreground text-xs italic">{t('noPillarsAssigned')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {enabledPillars.map((pillarId) => {
              const Icon = PILLAR_ICONS[pillarId] || Sliders
              return (
                <div key={pillarId} className="border-primary/30 bg-primary/5 flex items-start gap-2.5 rounded-lg border p-3">
                  <div className="bg-primary text-primary-foreground mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md">
                    <Icon className="size-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs leading-tight font-semibold">{t(`pillarLabels.${pillarId}`)}</span>
                      <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                        {t('activeBadge')}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-snug">{t(`pillarDesc.${pillarId}`)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
