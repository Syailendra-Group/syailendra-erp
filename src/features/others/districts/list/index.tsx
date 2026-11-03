'use client'

import { useState } from 'react'
import { Compass } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { DistrictProvider } from '@/contexts/others/district.context'

import { DistrictsDialogs } from './dialogs'
import { DistrictsPrimaryButtons } from './primary-buttons'
import { DistrictsTable } from './table'

import type { DistrictRecord } from '@/types/others/district'
import type { ReactElement } from 'react'

function DistrictsContent(): ReactElement {
  const t = useTranslations('regional.districts')
  const [archiveTarget, setArchiveTarget] = useState<DistrictRecord | null>(null)

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={Compass} actions={<DistrictsPrimaryButtons />} />
      <DistrictsTable onArchive={setArchiveTarget} />
      <DistrictsDialogs archiveTarget={archiveTarget} onCloseArchive={() => setArchiveTarget(null)} />
    </div>
  )
}

export function DistrictsFeature(): ReactElement {
  return (
    <DistrictProvider>
      <DistrictsContent />
    </DistrictProvider>
  )
}
