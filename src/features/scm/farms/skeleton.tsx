/**
 * skeleton.tsx — Layout-mirrored loading skeleton for the Farm create/edit form
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { Skeleton } from '@/components/ui/skeleton'

import type { ReactElement } from 'react'

export function FarmFormSkeleton(): ReactElement {
  return (
    <div className="space-y-4 sm:space-y-6" aria-busy="true">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-3.5 w-72" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="flex w-full flex-wrap gap-2">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-9 min-w-36 flex-1 rounded-md" />
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <div className="bg-card rounded-xl p-5 shadow-xs">
          <div className="space-y-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
          </div>
        </div>

        <div className="bg-card space-y-4 rounded-xl p-5 shadow-xs">
          <Skeleton className="h-64 w-full rounded-md" />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
