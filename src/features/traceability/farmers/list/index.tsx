'use client'

import { Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { FarmersProvider } from '@/contexts/traceability/farmer.context'
import { useFarmersQuery } from '@/hooks/traceability/use-farmers'

import { FarmersDialogs } from './dialogs'
import { FarmersPrimaryButtons } from './primary-buttons'
import { FarmersTable } from './table'

import type { FarmerRecord } from '@/types/traceability/farmer'
import type { ReactElement } from 'react'

export interface FarmersFeatureProps {
  initialData?: FarmerRecord[]
}

export function FarmersFeature({ initialData = [] }: FarmersFeatureProps): ReactElement {
  const tTrace = useTranslations('traceability.farmers')
  const { data: farmers = initialData, refetch } = useFarmersQuery()

  return (
    <FarmersProvider refreshData={refetch}>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader title={tTrace('title')} description={tTrace('subtitle')} icon={Users} actions={<FarmersPrimaryButtons />} />

        {/* Data Table */}
        <FarmersTable data={farmers} />

        {/* Dialogs */}
        <FarmersDialogs />
      </div>
    </FarmersProvider>
  )
}
