'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              <Users className="size-4 sm:size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{tTrace('title')}</h1>
              <p className="text-muted-foreground text-xs sm:text-sm">{tTrace('subtitle')}</p>
            </div>
          </div>

          <FarmersPrimaryButtons />
        </div>

        {/* Data Table */}
        <FarmersTable data={data} />

        {/* Dialogs */}
        <FarmersDialogs />
      </div>
    </FarmersProvider>
  )
}
