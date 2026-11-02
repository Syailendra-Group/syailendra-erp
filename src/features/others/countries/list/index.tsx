'use client'

import { Globe } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { useCountriesQuery } from '@/hooks/others/use-countries'

import { CountriesTable } from './table'

import type { CountryRecord } from '@/types/others/country'
import type { ReactElement } from 'react'

export interface CountriesFeatureProps {
  initialData?: CountryRecord[]
}

export function CountriesFeature({ initialData = [] }: CountriesFeatureProps): ReactElement {
  const t = useTranslations('regional.countries')
  const { data: countries = initialData } = useCountriesQuery()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={Globe} />
      <CountriesTable data={countries} />
    </div>
  )
}
