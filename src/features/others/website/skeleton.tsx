'use client'

import { Skeleton } from '@/components/ui/skeleton'

import type { ReactElement } from 'react'

export function WebsiteSkeleton(): ReactElement {
  return (
    <div className="space-y-4 sm:space-y-6" aria-busy="true" aria-label="Loading website settings">
      {/* PageHeader Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-56 sm:w-72" />
            <Skeleton className="h-3.5 w-72 sm:w-96" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </div>

      {/* 2-Column Identity & Theme Palette Cards Skeleton (Matching Card: bg-card, shadow-xs, no border) */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Identity Card Skeleton */}
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <Skeleton className="h-20 w-full rounded-md" />
        </div>

        {/* Theme Palette Card Skeleton (2-Column Color Inputs) */}
        <div className="bg-card space-y-4 rounded-xl p-5 shadow-xs">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md sm:col-span-2" />
          </div>
          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Full-Width 3 Logos Section Card Skeleton */}
      <div className="bg-card space-y-4 rounded-xl p-5 shadow-xs">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-3 w-80" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="aspect-[4/3] max-w-[240px] rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="aspect-[4/3] max-w-[240px] rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="size-40 rounded-xl sm:size-44" />
          </div>
        </div>
      </div>
    </div>
  )
}
