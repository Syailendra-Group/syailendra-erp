'use client'

import { Globe } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PrimaryAction } from '@/components/button/primary-action'
import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { CountryProvider, useCountry } from '@/contexts/others/country.context'

import { CountriesDialogs } from './dialogs'
import { CountriesTable } from './table'

import type { ReactElement } from 'react'

function CountriesContent(): ReactElement {
  const t = useTranslations('others.countries')
  const { handleCreate } = useCountry()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Globe}
        actions={<PrimaryAction onClick={handleCreate} label={t('primaryAction')} />}
      />

      <SectionCard>
        <CountriesTable />
      </SectionCard>

      <CountriesDialogs />
    </div>
  )
}

export function CountriesFeature(): ReactElement {
  return (
    <CountryProvider>
      <CountriesContent />
    </CountryProvider>
  )
}

export * from './columns'
export * from './dialogs'
export * from './table'
