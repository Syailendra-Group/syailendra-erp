'use client'

import { Landmark, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { ProvinceProvider, useProvince } from '@/contexts/others/province.context'

import { ProvincesDialogs } from './dialogs'
import { ProvincesTable } from './table'

import type { ReactElement } from 'react'

function ProvincesPrimaryButtons(): ReactElement {
  const { setOpen, setCurrentRow } = useProvince()
  return (
    <Button
      onClick={() => {
        setCurrentRow(null)
        setOpen('create')
      }}
      className="gap-2 font-semibold"
    >
      <Plus className="size-4" />
      <span>Tambah Provinsi</span>
    </Button>
  )
}

function ProvincesContent(): ReactElement {
  const t = useTranslations('regional.provinces')

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={Landmark} actions={<ProvincesPrimaryButtons />} />
      <ProvincesTable />
      <ProvincesDialogs />
    </div>
  )
}

export function ProvincesFeature(): ReactElement {
  return (
    <ProvinceProvider>
      <ProvincesContent />
    </ProvinceProvider>
  )
}
