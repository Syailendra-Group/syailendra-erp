import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

import type { Column } from '@tanstack/react-table'
import type { HTMLAttributes, ReactElement } from 'react'

export interface DataTableColumnHeaderProps<TData, TValue> extends HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({ column, title, className }: DataTableColumnHeaderProps<TData, TValue>): ReactElement {
  const tTable = useTranslations('common.table')

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="data-[state=open]:bg-accent -ml-3 h-8 cursor-pointer">
            <span>{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)} className="cursor-pointer text-xs">
            <ArrowUp className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            {tTable('asc')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)} className="cursor-pointer text-xs">
            <ArrowDown className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            {tTable('desc')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.clearSorting()} className="cursor-pointer text-xs">
            <RotateCcw className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            {tTable('default')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)} className="cursor-pointer text-xs">
            <EyeOff className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            {tTable('hide')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
