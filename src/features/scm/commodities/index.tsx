'use client'

import { Sprout } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PrimaryAction } from '@/components/button/primary-action'
import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { CommodityProvider, useCommodityContext } from '@/contexts/scm/commodity.context'

import { CommodityDialogs } from './dialogs'
import { CommoditiesTable } from './table'

import type { ReactElement } from 'react'

function CommodityContent(): ReactElement {
  const t = useTranslations('scm.commodities')
  const { handleCreate } = useCommodityContext()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Sprout}
        actions={<PrimaryAction onClick={handleCreate} label={t('actions.create')} />}
      />

      <SectionCard>
        <CommoditiesTable />
      </SectionCard>

      <CommodityDialogs />
    </div>
  )
}

export function CommoditiesFeature(): ReactElement {
  return (
    <CommodityProvider>
      <CommodityContent />
    </CommodityProvider>
  )
}
