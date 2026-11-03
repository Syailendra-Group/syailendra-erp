import { Skeleton } from '@/components/ui/skeleton'
import { TableBody, TableCell, TableRow } from '@/components/ui/table'

import type { ReactElement } from 'react'

export interface DataTableSkeletonProps {
  columnCount: number
  rowCount?: number
}

export function DataTableSkeleton({ columnCount, rowCount = 10 }: DataTableSkeletonProps): ReactElement {
  return (
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
  )
}
