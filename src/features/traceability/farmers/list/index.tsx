'use client'

import { Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { FarmersProvider } from '@/contexts/traceability/farmer.context'

import { FarmersDialogs } from './dialogs'
import { FarmersPrimaryButtons } from './primary-buttons'
import { FarmersTable } from './table'

import type { ReactElement } from 'react'

export function FarmersFeature(): ReactElement {
  const tTrace = useTranslations('traceability.farmers')

  return (
    <FarmersProvider refreshData={() => {}}>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader title={tTrace('title')} description={tTrace('subtitle')} icon={Users} actions={<FarmersPrimaryButtons />} />

        {/* Server-Driven Data Table */}
        <FarmersTable />

        {/* Dialogs */}
        <FarmersDialogs />
      </div>
    </FarmersProvider>
  )
}
