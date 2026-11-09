'use client'

import { Landmark } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PrimaryAction } from '@/components/button/primary-action'
import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { ProvinceProvider, useProvince } from '@/contexts/others/province.context'

import { ProvincesDialogs } from './dialogs'
import { ProvincesTable } from './table'

import type { ReactElement } from 'react'

function ProvincesContent(): ReactElement {
  const t = useTranslations('others.provinces')
  const { handleCreate } = useProvince()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Landmark}
        actions={<PrimaryAction onClick={handleCreate} label={t('primaryAction')} />}
      />

      <SectionCard>
        <ProvincesTable />
      </SectionCard>

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

export * from './columns'
export * from './dialogs'
export * from './table'
