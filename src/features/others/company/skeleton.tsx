'use client'

import { Skeleton } from '@/components/ui/skeleton'

import type { ReactElement } from 'react'

export function CompanySkeleton(): ReactElement {
  return (
    <div className="space-y-4 sm:space-y-6" aria-busy="true" aria-label="Loading company settings">
      {/* PageHeader Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48 sm:w-64" />
            <Skeleton className="h-3.5 w-64 sm:w-96" />
          </div>
        </div>
        <Skeleton className="h-6 w-36 rounded-full" />
      </div>

      {/* Full-Width PillTabs Skeleton (4 Entities) */}
      <div className="bg-muted/40 flex w-full flex-wrap gap-2 rounded-xl border p-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 min-w-[140px] flex-1 rounded-md" />
        ))}
      </div>

      {/* 2-Column Main Form Cards Skeleton (Matching Card: bg-card, shadow-xs, no border) */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Identity & Logo Card */}
        <div className="bg-card space-y-4 rounded-xl p-5 shadow-xs">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-64" />
          </div>
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-2.5 w-56" />
            <Skeleton className="size-40 rounded-xl sm:size-44" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Skeleton className="h-9 w-full rounded-md sm:col-span-1" />
            <Skeleton className="h-9 w-full rounded-md sm:col-span-2" />
          </div>
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* Communications & Address Card */}
        <div className="bg-card space-y-4 rounded-xl p-5 shadow-xs">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <Skeleton className="h-20 w-full rounded-md" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Skeleton className="h-9 w-full rounded-md sm:col-span-2" />
            <Skeleton className="h-9 w-full rounded-md sm:col-span-1" />
          </div>
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </div>

      {/* Pillars Allocation Card Skeleton */}
      <div className="bg-card space-y-4 rounded-xl p-5 shadow-xs">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-3 w-80" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
