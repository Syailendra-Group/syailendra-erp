'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { Factory } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
        {/* Header with Title, Subtitle, and Top-Right Primary Button */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              <Factory className="size-4 sm:size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{tTrace('title')}</h1>
              <p className="text-muted-foreground text-xs sm:text-sm">{tTrace('subtitle')}</p>
            </div>
          </div>
          <DistillersPrimaryButtons />
        </div>

        {/* Data Table */}
        <DistillersTable data={data} />

        {/* Modals & Dialogs */}
        <DistillersActionDialog />
        <DistillersDialogs />
      </div>
    </DistillersProvider>
  )
}
