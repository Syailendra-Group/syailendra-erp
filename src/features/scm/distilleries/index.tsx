'use client'

import { Factory } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PrimaryAction } from '@/components/button/primary-action'
import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { DistilleriesProvider, useDistilleries } from '@/contexts/scm/distillery.context'

import { DistilleriesDialogs } from './dialogs'
import { DistilleriesTable } from './table'

import type { ReactElement } from 'react'

function DistilleriesContent(): ReactElement {
  const tTrace = useTranslations('scm.distilleries')
  const { handleCreate } = useDistilleries()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={tTrace('title')}
        description={tTrace('subtitle')}
        icon={Factory}
        actions={<PrimaryAction onClick={handleCreate} label={tTrace('primaryAction')} />}
      />

      <SectionCard>
        <DistilleriesTable />
      </SectionCard>

      <DistilleriesDialogs />
    </div>
  )
}

export function DistilleriesFeature(): ReactElement {
  return (
    <DistilleriesProvider>
      <DistilleriesContent />
    </DistilleriesProvider>
  )
}

export * from './table'
export * from './columns'
export * from './dialogs'
