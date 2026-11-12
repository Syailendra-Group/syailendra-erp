'use client'

import { Building2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PrimaryAction } from '@/components/button/primary-action'
import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { RegencyProvider, useRegency } from '@/contexts/sbi/others/regency.context'

import { RegenciesDialogs } from './dialogs'
import { RegenciesTable } from './table'

import type { ReactElement } from 'react'

function RegenciesContent(): ReactElement {
  const t = useTranslations('others.regencies')
  const { handleCreate } = useRegency()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Building2}
        actions={<PrimaryAction onClick={handleCreate} label={t('primaryAction')} />}
      />

      <SectionCard>
        <RegenciesTable />
      </SectionCard>

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

export * from './table'
export * from './columns'
export * from './dialogs'
