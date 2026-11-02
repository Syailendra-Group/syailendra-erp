'use client'

import { useState } from 'react'
import { Navigation } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { VillageProvider } from '@/contexts/others/village.context'
import { useVillagesQuery } from '@/hooks/others/use-villages'

import { VillagesDialogs } from './dialogs'
import { VillagesPrimaryButtons } from './primary-buttons'
import { VillagesTable } from './table'

import type { VillageRecord } from '@/types/others/village'
import type { ReactElement } from 'react'

export interface VillagesFeatureProps {
  initialData?: VillageRecord[]
}

function VillagesContent({ initialData = [] }: VillagesFeatureProps): ReactElement {
  const t = useTranslations('regional.villages')
  const { data: villages = initialData } = useVillagesQuery()
  const [archiveTarget, setArchiveTarget] = useState<VillageRecord | null>(null)

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={Navigation} actions={<VillagesPrimaryButtons />} />
      <VillagesTable data={villages} onArchive={setArchiveTarget} />
      <VillagesDialogs archiveTarget={archiveTarget} onCloseArchive={() => setArchiveTarget(null)} />
    </div>
  )
}

export function VillagesFeature({ initialData = [] }: VillagesFeatureProps): ReactElement {
  return (
    <VillageProvider>
      <VillagesContent initialData={initialData} />
    </VillageProvider>
  )
}
