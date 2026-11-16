import { Skeleton } from '@/components/ui/skeleton'

import type { ReactElement } from 'react'

export function FormPageSkeleton(): ReactElement {
  return (
    <div className="space-y-4 sm:space-y-6" aria-busy="true" aria-live="polite" role="status">
      <span className="sr-only">Loading</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-8 w-36 rounded-md" />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={`skeleton-card-${index}`} className="bg-card space-y-4 rounded-lg border p-4 sm:p-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-64" />
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, fieldIndex) => (
                <div key={`skeleton-field-${index}-${fieldIndex}`} className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-8 w-full rounded-md" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card space-y-4 rounded-lg border p-4 sm:p-6">
        <Skeleton className="h-5 w-48" />
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={`skeleton-wide-${index}`} className="h-24 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}
