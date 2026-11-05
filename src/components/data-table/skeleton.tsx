/**
 * skeleton.tsx — Complete, self-contained table skeleton with header and body
 * Syailendra Group ERP
 */

import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

import type { ReactElement } from 'react'

export interface DataTableSkeletonProps {
  columnCount: number
  rowCount?: number
  className?: string
}

export function DataTableSkeleton({ columnCount, rowCount = 10, className }: DataTableSkeletonProps): ReactElement {
  return (
    <Table className={className}>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <TableHead key={`skeleton-th-${colIndex}`} className={cn(colIndex === columnCount - 1 && 'w-[100px] text-center')}>
              <Skeleton
                className={colIndex === 0 ? 'h-4 w-14' : colIndex === 1 ? 'h-4 w-28' : colIndex === columnCount - 1 ? 'mx-auto h-4 w-12' : 'h-4 w-20'}
              />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <TableRow key={`skeleton-row-${rowIndex}`} className="hover:bg-transparent">
            {Array.from({ length: columnCount }).map((_, colIndex) => (
              <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`} className="py-3">
                <Skeleton
                  className={
                    colIndex === 0
                      ? 'h-4 w-16'
                      : colIndex === 1
                        ? 'h-4 w-36'
                        : colIndex === columnCount - 1
                          ? 'mx-auto h-7 w-20 rounded-md'
                          : 'h-4 w-24'
                  }
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
