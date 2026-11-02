'use client'

import { Building, Mail, Phone } from 'lucide-react'

import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { StatusBadge } from '@/components/shared/status-badge'

import { DataTableRowActions } from './row-actions'

import type { EmployeeRecord } from '@/types/hris/employee'
import type { ColumnDef } from '@tanstack/react-table'

export interface GetColumnsOptions {
  tAdmin: (key: string) => string
  tCommon: (key: string) => string
}

export function getColumns({ tAdmin, tCommon }: GetColumnsOptions): ColumnDef<EmployeeRecord>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tAdmin('table.name')} />,
      cell: ({ row }) => {
        const emp = row.original
        return <div className="text-foreground font-semibold">{emp.name}</div>
      },
      enableSorting: true
    },
    {
      accessorKey: 'job_title',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tAdmin('table.job_title')} />,
      cell: ({ row }) => <span className="text-muted-foreground text-xs font-medium">{row.original.job_title || tAdmin('table.defaultJob')}</span>
    },
    {
      accessorKey: 'department_id',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tAdmin('table.department')} />,
      cell: ({ row }) => {
        const dept = row.original.department_id
        return (
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Building className="text-primary h-3.5 w-3.5" />
            <span>{dept ? dept[1] : tAdmin('table.defaultDept')}</span>
          </span>
        )
      },
      filterFn: (row, id, value) => {
        const dept = row.getValue(id) as [number, string] | false
        const deptName = dept ? dept[1] : 'Pusat'
        return value.includes(deptName)
      }
    },
    {
      accessorKey: 'work_email',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tAdmin('table.contact')} />,
      cell: ({ row }) => {
        const emp = row.original
        return (
          <div className="space-y-0.5 text-[11px]">
            {emp.work_email && (
              <div className="text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span>{emp.work_email}</span>
              </div>
            )}
            {emp.work_phone && (
              <div className="text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{emp.work_phone}</span>
              </div>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: 'active',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tAdmin('table.status')} className="justify-center" />,
      cell: ({ row }) => {
        const active = row.original.active
        return (
          <div className="flex justify-center">
            <StatusBadge variant={active ? 'success' : 'neutral'}>{active ? tCommon('status.active') : tCommon('status.archived')}</StatusBadge>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        const activeStr = row.getValue(id) ? 'true' : 'false'
        return value.includes(activeStr)
      }
    },
    {
      id: 'actions',
      header: () => <div className="text-center text-xs font-semibold">{tAdmin('table.actions')}</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <DataTableRowActions row={row.original} />
        </div>
      ),
      enableHiding: false,
      enableSorting: false
    }
  ]
}
