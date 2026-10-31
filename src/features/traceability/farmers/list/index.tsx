'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'

import { getFarmersAction } from '../actions'
import { FarmersProvider } from '../context'
import { FarmersDialogs } from './dialogs'
import { FarmersPrimaryButtons } from './primary-buttons'
import { FarmersTable } from './table'

import type { ReactElement } from 'react'
import type { FarmerRecord } from '../actions'

export interface FarmersFeatureProps {
  initialData?: FarmerRecord[]
}

export function FarmersFeature({ initialData = [] }: FarmersFeatureProps): ReactElement {
  const tTrace = useTranslations('traceability.farmers')
  const [data, setData] = useState<FarmerRecord[]>(initialData)
  const [, startTransition] = useTransition()

  const refreshData = useCallback(() => {
    startTransition(async () => {
      const res = await getFarmersAction()
      setData(res.farmers)
    })
  }, [])

  useEffect(() => {
    if (initialData.length === 0) {
      refreshData()
    }
  }, [initialData.length, refreshData])

  return (
    <FarmersProvider refreshData={refreshData}>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader title={tTrace('title')} description={tTrace('subtitle')} icon={Users} actions={<FarmersPrimaryButtons />} />

        {/* Data Table */}
        <FarmersTable data={data} />

        {/* Dialogs */}
        <FarmersDialogs />
      </div>
    </FarmersProvider>
  )
}
