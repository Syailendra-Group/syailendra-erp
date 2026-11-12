'use client'

import { Compass } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PrimaryAction } from '@/components/button/primary-action'
import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { DistrictProvider, useDistrict } from '@/contexts/sbi/others/district.context'

import { DistrictsDialogs } from './dialogs'
import { DistrictsTable } from './table'

import type { ReactElement } from 'react'

function DistrictsContent(): ReactElement {
  const t = useTranslations('others.districts')
  const { handleCreate } = useDistrict()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Compass}
        actions={<PrimaryAction onClick={handleCreate} label={t('primaryAction')} />}
      />

      <SectionCard>
        <DistrictsTable />
      </SectionCard>

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

export * from './columns'
export * from './dialogs'
export * from './table'
