'use client'

import { Box, Droplet, Layers, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PrimaryAction } from '@/components/button/primary-action'
import { SectionCard } from '@/components/card/section-card'
import { SummaryCard } from '@/components/card/summary-card'
import { PageHeader } from '@/components/shared/page-header'
import { MaterialProvider, useMaterial } from '@/contexts/sbi/scm/material.context'
import { useMaterialsPaginatedQuery } from '@/hooks/sbi/scm/use-materials'

import { MaterialsDialogs } from './dialogs'
import { MaterialsTable } from './table'

import type { ReactElement } from 'react'

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
  const { handleCreate } = useMaterial()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Sparkles}
        actions={<PrimaryAction onClick={handleCreate} label={t('primaryAction')} />}
      />

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

export * from './table'
export * from './columns'
export * from './dialogs'
