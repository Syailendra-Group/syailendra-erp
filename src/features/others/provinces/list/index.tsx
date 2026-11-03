'use client'

import { MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { ProvinceProvider } from '@/contexts/others/province.context'

import { ProvincesDialogs } from './dialogs'
import { ProvincesPrimaryButtons } from './primary-buttons'
import { ProvincesTable } from './table'

import type { ReactElement } from 'react'

function ProvincesContent(): ReactElement {
  const t = useTranslations('regional.provinces')

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={MapPin} actions={<ProvincesPrimaryButtons />} />
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
