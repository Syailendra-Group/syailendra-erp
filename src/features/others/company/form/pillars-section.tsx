'use client'

import { useMemo } from 'react'
import { ArrowRight, Sliders } from 'lucide-react'

import { SectionCard } from '@/components/card/section-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PILLAR_ICONS } from '@/data/pillar-catalog'
import { usePillarsQuery } from '@/hooks/others/use-menus'
import { Link } from '@/i18n/navigation'

import type { CompanyFormValues } from '@/schemas/others/company-schema'
import type { ModuleTab } from '@/stores/nav-store'
import type { PillarRecord } from '@/types/others/menu'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

interface PillarsSectionProps {
  form: UseFormReturn<CompanyFormValues>
  t: (key: string) => string
}

export function PillarsSection({ form, t }: PillarsSectionProps): ReactElement {
  const enabledPillars = form.watch('enabled_pillars') || []
  const { data: pillarsData } = usePillarsQuery()

  const pillarMap = useMemo(() => {
    const map = new Map<ModuleTab, PillarRecord>()
    pillarsData?.pillars?.forEach((p) => map.set(p.code, p))
    return map
  }, [pillarsData])

  return (
    <SectionCard
      title={t('sections.pillars.title')}
      description={t('sections.pillars.subtitle')}
      icon={Sliders}
      headerActions={
        <Button asChild variant="outline" className="gap-1.5 font-semibold">
          <Link href="/others/menus">
            <Sliders className="size-4" />
            <span>{t('managePillarAllocation')}</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      }
    >
      {enabledPillars.length === 0 ? (
        <p className="text-muted-foreground text-xs italic">{t('noPillarsAssigned')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {enabledPillars.map((pillarId) => {
            const Icon = PILLAR_ICONS[pillarId] || Sliders
            const dynamicPillar = pillarMap.get(pillarId)
            const title = dynamicPillar ? `${dynamicPillar.short_name} (${dynamicPillar.name})` : t(`pillarLabels.${pillarId}`)
            const desc = dynamicPillar?.description || t(`pillarDesc.${pillarId}`)

            return (
              <div key={pillarId} className="border-primary/30 bg-primary/5 flex items-start gap-2.5 rounded-lg border p-3">
                <div className="bg-primary text-primary-foreground mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md">
                  <Icon className="size-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs leading-tight font-semibold">{title}</span>
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                      {t('activeBadge')}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-snug">{desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}
