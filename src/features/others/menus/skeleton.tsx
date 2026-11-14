'use client'

import { Skeleton } from '@/components/ui/skeleton'

import type { ReactElement } from 'react'

export function MenusSummarySkeleton(): ReactElement {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4" aria-busy="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card space-y-3 rounded-xl p-3 shadow-xs sm:p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-32 sm:w-36" />
            <Skeleton className="size-7 rounded-md" />
          </div>
          <Skeleton className="h-6 w-20 sm:h-7" />
          <Skeleton className="h-3 w-36 sm:w-44" />
        </div>
      ))}
    </div>
  )
}
