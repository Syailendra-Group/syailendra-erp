'use client'

import { Factory } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PrimaryAction } from '@/components/button/primary-action'
import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { DistillersProvider, useDistillers } from '@/contexts/scm/distiller.context'

import { DistillersDialogs } from './dialogs'
import { DistillersTable } from './table'

import type { ReactElement } from 'react'

function DistillersContent(): ReactElement {
  const tTrace = useTranslations('scm.distillers')
  const { handleCreate } = useDistillers()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={tTrace('title')}
        description={tTrace('subtitle')}
        icon={Factory}
        actions={<PrimaryAction onClick={handleCreate} label={tTrace('primaryAction')} />}
      />

      <SectionCard>
        <DistillersTable />
      </SectionCard>

      <DistillersDialogs />
    </div>
  )
}

export function DistillersFeature(): ReactElement {
  return (
    <DistillersProvider>
      <DistillersContent />
    </DistillersProvider>
  )
}

export * from './table'
export * from './columns'
export * from './dialogs'
