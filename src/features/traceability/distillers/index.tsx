'use client'

import { Factory } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { DistillersProvider } from '@/contexts/traceability/distiller.context'
import { useDistillersQuery } from '@/hooks/traceability/use-distillers'

import { DistillersDialogs } from './dialogs'
import { DistillersActionDialog } from './form'
import { DistillersPrimaryButtons } from './primary-buttons'
import { DistillersTable } from './table'

import type { DistillerRecord } from '@/types/traceability/distiller'
import type { ReactElement } from 'react'

export interface DistillersFeatureProps {
  initialData?: DistillerRecord[]
}

export function DistillersFeature({ initialData = [] }: DistillersFeatureProps): ReactElement {
  const tTrace = useTranslations('traceability.distillers')
  const { data: distillers = initialData, refetch } = useDistillersQuery()

  return (
    <DistillersProvider refreshData={refetch}>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader title={tTrace('title')} description={tTrace('subtitle')} icon={Factory} actions={<DistillersPrimaryButtons />} />

        {/* Data Table */}
        <DistillersTable data={distillers} />

        {/* Modals & Dialogs */}
        <DistillersActionDialog />
        <DistillersDialogs />
      </div>
    </DistillersProvider>
  )
}
