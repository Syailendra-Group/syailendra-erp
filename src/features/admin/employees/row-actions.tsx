'use client'

import * as React from 'react'
import { Archive, Edit2, MoreHorizontal, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useEmployees } from '@/contexts/employees-context'
import { cn } from '@/lib/utils'

import type { EmployeeRecord } from './actions'

export interface DataTableRowActionsProps {
  row: EmployeeRecord
}

export function DataTableRowActions({ row }: DataTableRowActionsProps): React.ReactElement {
  const { setOpen, setCurrentRow } = useEmployees()

  return (
    <div className="flex items-center justify-end gap-1.5">
      {/* Direct Edit Button */}
      <Button
        variant="outline"
        size="sm"
        className="h-7 cursor-pointer gap-1 px-2.5 text-xs font-medium"
        onClick={() => {
          setCurrentRow(row)
          setOpen('edit')
        }}
      >
        <Edit2 className="text-primary h-3 w-3" />
        <span>Ubah</span>
      </Button>

      {/* Direct Archive/Reactivate Button */}
      <Button
        variant="outline"
        size="sm"
        className={cn(
          'h-7 cursor-pointer gap-1 px-2.5 text-xs font-medium',
          row.active ? 'text-destructive hover:bg-destructive/10 hover:text-destructive border-border/80' : 'text-muted-foreground hover:bg-muted'
        )}
        onClick={() => {
          setCurrentRow(row)
          setOpen('archive')
        }}
      >
        {row.active ? (
          <>
            <Archive className="h-3 w-3" />
            <span>Arsipkan</span>
          </>
        ) : (
          <>
            <RotateCcw className="h-3 w-3" />
            <span>Pulihkan</span>
          </>
        )}
      </Button>

      {/* Optional dropdown for more details */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted flex h-7 w-7 cursor-pointer p-0">
            <MoreHorizontal className="text-muted-foreground h-3.5 w-3.5" />
            <span className="sr-only">Menu Tambahan</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-xs"
            onClick={() => {
              navigator.clipboard?.writeText(String(row.id))
            }}
          >
            <span>Salin ID Odoo</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-xs"
            onClick={() => {
              setCurrentRow(row)
              setOpen('edit')
            }}
          >
            <Edit2 className="text-muted-foreground h-3.5 w-3.5" />
            <span>Buka Formulir</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
