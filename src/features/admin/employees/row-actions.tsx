'use client'

import { Archive, Edit2, Eye, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEmployees } from '@/contexts/employees-context'
import { cn } from '@/lib/utils'

import type { ReactElement } from 'react'
import type { EmployeeRecord } from './actions'

export interface DataTableRowActionsProps {
  row: EmployeeRecord
}

export function DataTableRowActions({ row }: DataTableRowActionsProps): ReactElement {
  const { setOpen, setCurrentRow } = useEmployees()
  const tCommon = useTranslations('common.actions')

  return (
    <div className="flex items-center justify-center gap-1">
      {/* View / Detail */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 cursor-pointer border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-950/40"
            onClick={() => {
              setCurrentRow(row)
              setOpen('view')
            }}
            aria-label={tCommon('view')}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{tCommon('view')}</p>
        </TooltipContent>
      </Tooltip>

      {/* Edit */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 cursor-pointer border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-900/50 dark:text-amber-400 dark:hover:bg-amber-950/40"
            onClick={() => {
              setCurrentRow(row)
              setOpen('edit')
            }}
            aria-label={tCommon('edit')}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{tCommon('edit')}</p>
        </TooltipContent>
      </Tooltip>

      {/* Archive/Restore */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'h-7 w-7 cursor-pointer',
              row.active
                ? 'text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive dark:border-destructive/40'
                : 'text-muted-foreground border-border/80 hover:bg-muted'
            )}
            onClick={() => {
              setCurrentRow(row)
              setOpen('archive')
            }}
            aria-label={row.active ? tCommon('archive') : tCommon('restore')}
          >
            {row.active ? <Archive className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{row.active ? tCommon('archive') : tCommon('restore')}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
