'use client'

import { useMemo } from 'react'
import { Factory, Leaf, ShieldCheck, Sliders, Target } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { SummaryCardGrid } from '@/components/card/summary-card'
import { PageHeader } from '@/components/shared/page-header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { MenuProvider } from '@/contexts/others/menu.context'
import { useCompaniesQuery } from '@/hooks/others/use-companies'
import { usePillarsQuery } from '@/hooks/others/use-menus'

import { MenusDialogs } from './dialogs'
import { MenusTable } from './table'

import type { SummaryCardItem } from '@/components/card/summary-card'
import type { ElementType, ReactElement } from 'react'

const ENTITY_ICONS: Record<number, ElementType> = {
  1: ShieldCheck,
  2: Factory,
  3: Target,
  4: Leaf
}

function MenusSummaryCards(): ReactElement {
  const t = useTranslations('others.menus')
  const { data: companiesData } = useCompaniesQuery()
  const { data: pillarsData } = usePillarsQuery()

  const companies = useMemo(() => companiesData?.companies || [], [companiesData])
  const pillars = useMemo(() => pillarsData?.pillars || [], [pillarsData])

  const summaryItems: SummaryCardItem[] = useMemo(() => {
    return companies.map((c) => {
      const owned = pillars.filter((p) => p.company_id === c.id)
      const codes = owned.map((p) => p.short_name).join(', ')
      return {
        title: `${c.short_name} - ${c.name}`,
        value: `${owned.length} ${t('pillarsCount')}`,
        subtitle: codes || t('noPillarsAssigned'),
        icon: ENTITY_ICONS[c.id] || ShieldCheck
      }
    })
  }, [companies, pillars, t])

  return <SummaryCardGrid items={summaryItems} />
}

function MenusContent(): ReactElement {
  const t = useTranslations('others.menus')

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={Sliders} />

      <Alert className="border-primary/30 bg-primary/5">
        <ShieldCheck className="text-primary size-4" />
        <AlertTitle className="text-xs font-semibold sm:text-sm">{t('exclusivityTitle')}</AlertTitle>
        <AlertDescription className="text-muted-foreground text-xs leading-relaxed">{t('exclusivityDesc')}</AlertDescription>
      </Alert>

      {/* Reusable Summary Cards defined in index */}
      <MenusSummaryCards />

      {/* SectionCard wrapping reusable DataTable */}
      <SectionCard title={t('matrixTitle')} description={t('matrixSubtitle')} icon={Sliders}>
        <MenusTable />
      </SectionCard>

      <MenusDialogs />
    </div>
  )
}

export function MenuAllocationFeature(): ReactElement {
  return (
    <MenuProvider>
      <MenusContent />
    </MenuProvider>
  )
}

export * from './columns'
export * from './dialogs'
export * from './table'
