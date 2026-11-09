'use client'

import { Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PrimaryAction } from '@/components/button/primary-action'
import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { FarmersProvider, useFarmers } from '@/contexts/scm/farmer.context'

import { FarmersDialogs } from './dialogs'
import { FarmersTable } from './table'

import type { ReactElement } from 'react'

function FarmersContent(): ReactElement {
  const t = useTranslations('scm.farmers')
  const { handleCreate } = useFarmers()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Users}
        actions={<PrimaryAction onClick={handleCreate} label={t('primaryAction')} />}
      />

      <SectionCard>
        <FarmersTable />
      </SectionCard>

      <FarmersDialogs />
    </div>
  )
}

export function FarmersFeature(): ReactElement {
  return (
    <FarmersProvider>
      <FarmersContent />
    </FarmersProvider>
  )
}

export * from './table'
export * from './columns'
export * from './dialogs'
export * from './form/index'
export * from './detail/index'
