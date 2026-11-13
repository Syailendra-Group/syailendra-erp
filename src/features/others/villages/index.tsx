'use client'

import { MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PrimaryAction } from '@/components/button/primary-action'
import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { useVillage, VillageProvider } from '@/contexts/others/village.context'

import { VillagesDialogs } from './dialogs'
import { VillagesTable } from './table'

import type { ReactElement } from 'react'

function VillagesContent(): ReactElement {
  const t = useTranslations('others.villages')
  const { handleCreate } = useVillage()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={MapPin}
        actions={<PrimaryAction onClick={handleCreate} label={t('primaryAction')} />}
      />

      <SectionCard>
        <VillagesTable />
      </SectionCard>

      <VillagesDialogs />
    </div>
  )
}

export function VillagesFeature(): ReactElement {
  return (
    <VillageProvider>
      <VillagesContent />
    </VillageProvider>
  )
}

export * from './columns'
export * from './dialogs'
export * from './table'
