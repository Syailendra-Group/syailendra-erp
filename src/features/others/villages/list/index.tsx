'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { VillageProvider } from '@/contexts/others/village.context'

import { VillagesDialogs } from './dialogs'
import { VillagesPrimaryButtons } from './primary-buttons'
import { VillagesTable } from './table'

import type { VillageRecord } from '@/types/others/village'
import type { ReactElement } from 'react'

function VillagesContent(): ReactElement {
  const t = useTranslations('regional.villages')
  const [archiveTarget, setArchiveTarget] = useState<VillageRecord | null>(null)

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={MapPin} actions={<VillagesPrimaryButtons />} />
      <VillagesTable onArchive={setArchiveTarget} />
      <VillagesDialogs archiveTarget={archiveTarget} onCloseArchive={() => setArchiveTarget(null)} />
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
