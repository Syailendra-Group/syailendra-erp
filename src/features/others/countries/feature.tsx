'use client'

import { Globe, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { CountryProvider, useCountry } from '@/contexts/others/country.context'

import { CountryDialogs } from './dialogs'
import { CountriesTable } from './table'

import type { ReactElement } from 'react'

function CountriesPrimaryButtons(): ReactElement {
  const { setOpen, setCurrentRow } = useCountry()
  return (
    <Button
      onClick={() => {
        setCurrentRow(null)
        setOpen('create')
      }}
      className="gap-2 font-semibold"
    >
      <Plus className="size-4" />
      <span>Tambah Negara</span>
    </Button>
  )
}

function CountriesContent(): ReactElement {
  const t = useTranslations('regional.countries')

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={Globe} actions={<CountriesPrimaryButtons />} />
      <CountriesTable />
      <CountryDialogs />
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
