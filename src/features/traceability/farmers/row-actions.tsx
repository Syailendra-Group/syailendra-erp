'use client'

import { Archive, Edit2, Eye, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { useFarmers } from './context'

import type { ReactElement } from 'react'
import type { FarmerRecord } from './actions'

export interface DataTableRowActionsProps {
  row: FarmerRecord
}

export function DataTableRowActions({ row }: DataTableRowActionsProps): ReactElement {
  const tCommon = useTranslations('common.actions')
  const { setOpen, setCurrentRow } = useFarmers()

  return (
    <div className="flex items-center justify-center gap-1">
      {/* 1. View Details Action */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="size-7 cursor-pointer border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-950/40"
            onClick={() => {
              setCurrentRow(row)
              setOpen('view')
            }}
          >
            <Eye className="size-3.5" />
            <span className="sr-only">{tCommon('view')}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{tCommon('view')}</p>
        </TooltipContent>
      </Tooltip>

      {/* 2. Edit Action */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="size-7 cursor-pointer border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-900/50 dark:text-amber-400 dark:hover:bg-amber-950/40"
            onClick={() => {
              setCurrentRow(row)
              setOpen('edit')
            }}
          >
            <Edit2 className="size-3.5" />
            <span className="sr-only">{tCommon('edit')}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{tCommon('edit')}</p>
        </TooltipContent>
      </Tooltip>

      {/* 3. Archive / Restore Action */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="text-destructive border-destructive/30 hover:bg-destructive/10 dark:border-destructive/40 dark:hover:bg-destructive/20 size-7 cursor-pointer"
            onClick={() => {
              setCurrentRow(row)
              setOpen('archive')
            }}
          >
            {row.active ? <Archive className="size-3.5" /> : <RotateCcw className="size-3.5" />}
            <span className="sr-only">{row.active ? tCommon('archive') : tCommon('restore')}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{row.active ? tCommon('archive') : tCommon('restore')}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
