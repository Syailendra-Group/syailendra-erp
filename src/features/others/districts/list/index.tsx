'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { useDistrictsQuery } from '@/hooks/others/use-districts'

import { DistrictsDialogs } from './dialogs'
import { DistrictsPrimaryButtons } from './primary-buttons'
import { DistrictsTable } from './table'

import type { DistrictRecord } from '@/types/others/district'
import type { ReactElement } from 'react'

export interface DistrictsFeatureProps {
  initialData?: DistrictRecord[]
}

export function DistrictsFeature({ initialData = [] }: DistrictsFeatureProps): ReactElement {
  const t = useTranslations('regional.districts')
  const { data: districts = initialData } = useDistrictsQuery()
  const [archiveTarget, setArchiveTarget] = useState<DistrictRecord | null>(null)

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={MapPin} actions={<DistrictsPrimaryButtons />} />
      <DistrictsTable data={districts} onArchive={setArchiveTarget} />
      <DistrictsDialogs target={archiveTarget} onClose={() => setArchiveTarget(null)} />
    </div>
  )
}
