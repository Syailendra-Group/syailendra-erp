'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { Factory } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'

import { getDistillersAction } from './actions'
import { DistillersProvider } from './context'
import { DistillersDialogs } from './dialogs'
import { DistillersActionDialog } from './form'
import { DistillersPrimaryButtons } from './primary-buttons'
import { DistillersTable } from './table'

import type { ReactElement } from 'react'
import type { DistillerRecord } from './actions'

export interface DistillersFeatureProps {
  initialData?: DistillerRecord[]
}

export function DistillersFeature({ initialData = [] }: DistillersFeatureProps): ReactElement {
  const tTrace = useTranslations('traceability.distillers')
  const [data, setData] = useState<DistillerRecord[]>(initialData)
  const [, startTransition] = useTransition()

  const refreshData = useCallback(() => {
    startTransition(async () => {
      const res = await getDistillersAction()
      setData(res.distillers)
    })
  }, [])

  useEffect(() => {
    if (initialData.length === 0) {
      refreshData()
    }
  }, [initialData.length, refreshData])

  return (
    <DistillersProvider refreshData={refreshData}>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader title={tTrace('title')} description={tTrace('subtitle')} icon={Factory} actions={<DistillersPrimaryButtons />} />

        {/* Data Table */}
        <DistillersTable data={data} />

        {/* Modals & Dialogs */}
        <DistillersActionDialog />
        <DistillersDialogs />
      </div>
    </DistillersProvider>
  )
}
