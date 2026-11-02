'use client'

import { useState } from 'react'
import { Building2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { RegencyProvider } from '@/contexts/others/regency.context'
import { useRegenciesQuery } from '@/hooks/others/use-regencies'

import { RegenciesDialogs } from './dialogs'
import { RegenciesPrimaryButtons } from './primary-buttons'
import { RegenciesTable } from './table'

import type { RegencyRecord } from '@/types/others/regency'
import type { ReactElement } from 'react'

export interface RegenciesFeatureProps {
  initialData?: RegencyRecord[]
}

function RegenciesContent({ initialData = [] }: RegenciesFeatureProps): ReactElement {
  const t = useTranslations('regional.regencies')
  const { data: regencies = initialData } = useRegenciesQuery()
  const [archiveTarget, setArchiveTarget] = useState<RegencyRecord | null>(null)

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={Building2} actions={<RegenciesPrimaryButtons />} />
      <RegenciesTable data={regencies} onArchive={setArchiveTarget} />
      <RegenciesDialogs archiveTarget={archiveTarget} onCloseArchive={() => setArchiveTarget(null)} />
    </div>
  )
}

export function RegenciesFeature({ initialData = [] }: RegenciesFeatureProps): ReactElement {
  return (
    <RegencyProvider>
      <RegenciesContent initialData={initialData} />
    </RegencyProvider>
  )
}
