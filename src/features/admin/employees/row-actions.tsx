'use client'

import * as React from 'react'
import { Archive, Edit2, MoreHorizontal, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useEmployees } from '@/contexts/employees-context'

import type { EmployeeRecord } from './actions'

export interface DataTableRowActionsProps {
  row: EmployeeRecord
}

export function DataTableRowActions({ row }: DataTableRowActionsProps): React.ReactElement {
  const { setOpen, setCurrentRow } = useEmployees()

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted flex h-8 w-8 cursor-pointer p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-xs"
            onClick={() => {
              setCurrentRow(row)
              setOpen('edit')
            }}
          >
            <Edit2 className="text-muted-foreground h-3.5 w-3.5" />
            <span>Ubah Data</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer gap-2 text-xs"
            onClick={() => {
              setCurrentRow(row)
              setOpen('archive')
            }}
          >
            {row.active ? (
              <>
                <Archive className="h-3.5 w-3.5" />
                <span>Arsipkan</span>
              </>
            ) : (
              <>
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Pulihkan</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
