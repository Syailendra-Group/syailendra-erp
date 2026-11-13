'use client'

import { type Table } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn, getPageNumbers } from '@/lib/utils'

import type { ReactElement } from 'react'

export interface DataTablePaginationProps<TData> {
  table: Table<TData>
  className?: string
}

export function DataTablePagination<TData>({ table, className }: DataTablePaginationProps<TData>): ReactElement {
  const tPagination = useTranslations('common.pagination')
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = table.getPageCount() || 1
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  return (
    <div
      className={cn('flex items-center justify-between overflow-clip px-2', '@max-2xl/content:flex-col-reverse @max-2xl/content:gap-4', className)}
      style={{ overflowClipMargin: 1 }}
    >
      <div className="flex w-full items-center justify-between sm:w-auto">
        <div className="text-muted-foreground text-xs sm:hidden">{tPagination('pageOf', { current: currentPage, total: totalPages })}</div>
        <div className="flex items-center gap-2">
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="w-17.5 text-xs">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`} className="text-xs">
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground hidden text-xs font-medium sm:block">{tPagination('rowsPerPage')}</p>
        </div>
      </div>

      <div className="flex items-center sm:space-x-6 lg:space-x-8">
        <div className="text-muted-foreground hidden items-center justify-center text-xs font-medium sm:flex">
          {tPagination('pageOf', { current: currentPage, total: totalPages })}
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8 p-0"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label={tPagination('firstPage')}
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label={tPagination('previousPage')}
          >
            <ChevronLeft className="size-4" />
          </Button>

          {/* Page number buttons */}
          {pageNumbers.map((pageNumber, index) => (
            <div key={`${pageNumber}-${index}`} className="flex items-center">
              {pageNumber === '...' ? (
                <span className="text-muted-foreground px-1 text-xs">...</span>
              ) : (
                <Button
                  variant={currentPage === pageNumber ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 min-w-8 px-2 text-xs font-semibold"
                  onClick={() => table.setPageIndex((pageNumber as number) - 1)}
                >
                  <span className="sr-only">{tPagination('pageOf', { current: pageNumber, total: totalPages })}</span>
                  {pageNumber}
                </Button>
              )}
            </div>
          ))}

          <Button
            variant="outline"
            size="icon"
            className="size-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label={tPagination('nextPage')}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 p-0"
            onClick={() => table.setPageIndex(totalPages - 1)}
            disabled={!table.getCanNextPage()}
            aria-label={tPagination('lastPage')}
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
