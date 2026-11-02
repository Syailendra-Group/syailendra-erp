'use client'

import { Landmark } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { useProvincesQuery } from '@/hooks/others/use-provinces'

import { ProvincesPrimaryButtons } from './primary-buttons'
import { ProvincesTable } from './table'

import type { ProvinceRecord } from '@/types/others/province'
import type { ReactElement } from 'react'

export interface ProvincesFeatureProps {
  initialData?: ProvinceRecord[]
}

export function ProvincesFeature({ initialData = [] }: ProvincesFeatureProps): ReactElement {
  const t = useTranslations('regional.provinces')
  const { data: provinces = initialData } = useProvincesQuery()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={Landmark} actions={<ProvincesPrimaryButtons />} />
      <ProvincesTable data={provinces} />
    </div>
  )
}
