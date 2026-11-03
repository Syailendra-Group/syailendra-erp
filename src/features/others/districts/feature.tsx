'use client'

import { Compass, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { DistrictProvider, useDistrict } from '@/contexts/others/district.context'

import { DistrictsDialogs } from './dialogs'
import { DistrictsTable } from './table'

import type { ReactElement } from 'react'

function DistrictsPrimaryButtons(): ReactElement {
  const { setOpen, setCurrentRow } = useDistrict()
  const t = useTranslations('others.districts')
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

function DistrictsContent(): ReactElement {
  const t = useTranslations('others.districts')
  const { setOpen, setCurrentRow } = useDistrict()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={Compass} actions={<DistrictsPrimaryButtons />} />
      <DistrictsTable
        onArchive={(item) => {
          setCurrentRow(item)
          setOpen('delete')
        }}
      />
      <DistrictsDialogs />
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
