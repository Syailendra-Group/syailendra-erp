'use client'

import { Building2, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { RegencyProvider, useRegency } from '@/contexts/others/regency.context'

import { RegenciesDialogs } from './dialogs'
import { RegenciesTable } from './table'

import type { ReactElement } from 'react'

function RegenciesPrimaryButtons(): ReactElement {
  const { setOpen, setCurrentRow } = useRegency()
  const t = useTranslations('others.regencies')
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

function RegenciesContent(): ReactElement {
  const t = useTranslations('others.regencies')
  const { setOpen, setCurrentRow } = useRegency()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={Building2} actions={<RegenciesPrimaryButtons />} />
      <RegenciesTable
        onArchive={(item) => {
          setCurrentRow(item)
          setOpen('delete')
        }}
      />
      <RegenciesDialogs />
    </div>
  )
}

export function RegenciesFeature(): ReactElement {
  return (
    <RegencyProvider>
      <RegenciesContent />
    </RegencyProvider>
  )
}
