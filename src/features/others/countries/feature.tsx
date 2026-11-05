'use client'

import { Globe, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { CountryProvider, useCountry } from '@/contexts/others/country.context'

import { CountriesDialogs } from './dialogs'
import { CountriesTable } from './table'

import type { ReactElement } from 'react'

function CountriesPrimaryButtons(): ReactElement {
  const { setOpen, setCurrentRow } = useCountry()
  const t = useTranslations('others.countries')
  return (
    <Button
      onClick={() => {
        setCurrentRow(null)
        setOpen('create')
      }}
      className="gap-2 font-semibold"
    >
      <Plus className="size-4" />
      <span>{t('primaryAction')}</span>
    </Button>
  )
}

function CountriesContent(): ReactElement {
  const t = useTranslations('others.countries')

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={Globe} actions={<CountriesPrimaryButtons />} />
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
