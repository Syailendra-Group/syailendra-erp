'use client'

import { useMemo } from 'react'
import { Building2, Layers, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { SummaryCardGrid } from '@/components/card/summary-card'
import { InfoAlert } from '@/components/shared/info-alert'
import { PageHeader } from '@/components/shared/page-header'
import { MenuProvider } from '@/contexts/others/menu.context'
import { useCompaniesQuery } from '@/hooks/others/use-companies'
import { usePillarsQuery } from '@/hooks/others/use-menus'

import { MenusDialogs } from './dialogs'
import { MenusSummarySkeleton } from './skeleton'
import { MenusTable } from './table'

import type { SummaryCardItem } from '@/components/card/summary-card'
import type { ReactElement } from 'react'

function MenusSummaryCards(): ReactElement {
  const t = useTranslations('others.menus')
  const { data: companiesData, isLoading: isCompaniesLoading } = useCompaniesQuery()
  const { data: pillarsData, isLoading: isPillarsLoading } = usePillarsQuery()

  const summaryItems: SummaryCardItem[] = useMemo(() => {
    const companies = companiesData?.companies || []
    const pillars = pillarsData?.pillars || []

    return companies.map((c) => {
      const assigned = pillars.filter((p) => p.company_id === c.id)
      const codesText = assigned.map((p) => p.short_name).join(', ') || '-'

      return {
        title: `${c.short_name} - ${c.name}`,
        value: `${assigned.length} ${t('Summary.modulesCount')}`,
        subtitle: `${t('Summary.allocatedList')}: ${codesText}`,
        icon: Building2
      }
    })
  }, [companiesData, pillarsData, t])

  if (isCompaniesLoading || isPillarsLoading) {
    return <MenusSummarySkeleton />
  }

  return <SummaryCardGrid items={summaryItems} />
}

export function MenuAllocationFeature(): ReactElement {
  const t = useTranslations('others.menus')

  return (
    <MenuProvider>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader title={t('title')} description={t('subtitle')} icon={Layers} />

        <InfoAlert title={t('exclusivityTitle')} description={t('exclusivityDesc')} icon={ShieldCheck} variant="info" />

        <MenusSummaryCards />

        <SectionCard title={t('matrixTitle')} description={t('matrixSubtitle')} icon={Layers} contentClassName="space-y-4">
          <MenusTable />
        </SectionCard>

        <MenusDialogs />
      </div>
    </MenuProvider>
  )
}
