'use client'

import { Box, Droplet, Layers, Plus, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { SummaryCard } from '@/components/card/summary-card'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { MaterialProvider } from '@/contexts/scm/material.context'
import { useMaterialsPaginatedQuery } from '@/hooks/scm/use-materials'
import { Link } from '@/i18n/navigation'

import { MaterialsDialogs } from './dialogs'
import { MaterialsTable } from './table'

import type { ReactElement } from 'react'

function MaterialsPrimaryButtons(): ReactElement {
  const t = useTranslations('scm.materials')

  return (
    <Button asChild className="gap-2 font-semibold">
      <Link href="/scm/materials/create">
        <Plus className="size-4" />
        <span>{t('primaryAction')}</span>
      </Link>
    </Button>
  )
}

function MaterialsSummaryCards(): ReactElement {
  const t = useTranslations('scm.materials')
  const { data: result } = useMaterialsPaginatedQuery({ perPage: 100 })

  const records = result?.records || []
  const total = result?.totalCount || 0
  const essentialOilsCount = records.filter((r) => r.category === 'essential_oils').length
  const rawBiomassCount = records.filter((r) => r.category === 'raw_biomass').length
  const lotTrackedCount = records.filter((r) => r.tracking === 'lot').length

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard item={{ title: t('summary.totalMaterials'), value: total, icon: Box }} />
      <SummaryCard item={{ title: t('summary.essentialOils'), value: essentialOilsCount, icon: Droplet }} />
      <SummaryCard item={{ title: t('summary.rawBiomass'), value: rawBiomassCount, icon: Layers }} />
      <SummaryCard item={{ title: t('summary.lotTrackingRatio'), value: lotTrackedCount, icon: Sparkles }} />
    </div>
  )
}

function MaterialsContent(): ReactElement {
  const t = useTranslations('scm.materials')

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={Sparkles} actions={<MaterialsPrimaryButtons />} />

      <MaterialsSummaryCards />

      <SectionCard>
        <MaterialsTable />
      </SectionCard>

      <MaterialsDialogs />
    </div>
  )
}

export function MaterialsFeature(): ReactElement {
  return (
    <MaterialProvider>
      <MaterialsContent />
    </MaterialProvider>
  )
}
