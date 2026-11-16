import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import type { ReactElement } from 'react'

export interface TablePageSkeletonProps {
  columnCount?: number
  rowCount?: number
}

export function TablePageSkeleton({ columnCount = 7, rowCount = 8 }: TablePageSkeletonProps): ReactElement {
  return (
    <div className="space-y-4 sm:space-y-6" aria-busy="true" aria-live="polite" role="status">
      <span className="sr-only">Loading</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-8 w-64 rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
        <div className="bg-card overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {Array.from({ length: columnCount }).map((_, index) => (
                  <TableHead key={`skeleton-th-${index}`}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rowCount }).map((_, rowIndex) => (
                <TableRow key={`skeleton-row-${rowIndex}`} className="hover:bg-transparent">
                  {Array.from({ length: columnCount }).map((_, colIndex) => (
                    <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`} className="py-3">
                      <Skeleton className={colIndex === 0 ? 'h-4 w-16' : colIndex === 1 ? 'h-4 w-36' : 'h-4 w-24'} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
