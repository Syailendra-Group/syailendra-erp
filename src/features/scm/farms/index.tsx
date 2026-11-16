'use client'

import { MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PrimaryAction } from '@/components/button/primary-action'
import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { FarmProvider } from '@/contexts/scm/farm.context'

import { FarmDialogs } from './dialogs'
import { FarmsTable } from './table'

import type { ReactElement } from 'react'

function FarmContent(): ReactElement {
  const t = useTranslations('scm.farms')

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={MapPin}
        actions={<PrimaryAction href="/scm/farms/create" label={t('actions.create')} />}
      />

      <SectionCard>
        <FarmsTable />
      </SectionCard>

      <FarmDialogs />
    </div>
  )
}

export function FarmsFeature(): ReactElement {
  return (
    <FarmProvider>
      <FarmContent />
    </FarmProvider>
  )
}
