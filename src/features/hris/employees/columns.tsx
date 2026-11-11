'use client'

import { Building, Mail, Phone } from 'lucide-react'

import { ActionButton } from '@/components/button/action-button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { StatusBadge } from '@/components/shared/data-badge'
import { IconText, LongText } from '@/components/text'

import type { EmployeeRecord } from '@/types/hris/employee'
import type { ColumnDef } from '@tanstack/react-table'

export interface GetColumnsOptions {
  tAdmin: (key: string) => string
  tCommon: (key: string) => string
  onView?: (employee: EmployeeRecord) => void
  onEdit?: (employee: EmployeeRecord) => void
  onDelete?: (employee: EmployeeRecord) => void
}

export function getColumns({ tAdmin, tCommon, onView, onEdit, onDelete }: GetColumnsOptions): ColumnDef<EmployeeRecord>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tAdmin('table.name')} />,
      cell: ({ row }) => <LongText className="text-foreground block max-w-50 text-xs font-semibold">{row.original.name}</LongText>,
      enableSorting: true
    },
    {
      accessorKey: 'job_title',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tAdmin('table.job_title')} />,
      cell: ({ row }) => (
        <LongText className="text-muted-foreground block max-w-40 text-xs font-medium">
          {row.original.job_title || tAdmin('table.defaultJob')}
        </LongText>
      )
    },
    {
      accessorKey: 'department_id',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tAdmin('table.department')} />,
      cell: ({ row }) => {
        const dept = row.original.department_id
        return (
          <IconText icon={Building} iconClassName="text-primary h-3.5 w-3.5">
            <LongText>{dept ? dept[1] : tAdmin('table.defaultDept')}</LongText>
          </IconText>
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
          <div className="max-w-40 space-y-0.5 text-[11px]">
            {emp.work_email && (
              <IconText icon={Mail} mono iconClassName="h-3 w-3">
                <LongText>{emp.work_email}</LongText>
              </IconText>
            )}
            {emp.work_phone && (
              <IconText icon={Phone} mono iconClassName="h-3 w-3">
                <LongText>{emp.work_phone}</LongText>
              </IconText>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: 'active',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tAdmin('table.status')} />,
      cell: ({ row }) => {
        const active = row.original.active
        return (
          <StatusBadge variant={active ? 'success' : 'neutral'} size="sm">
            {active ? tCommon('status.active') : tCommon('status.inactive')}
          </StatusBadge>
        )
      },
      enableSorting: true
    },
    {
      id: 'actions',
      header: () => <div className="text-center">{tCommon('table.actions')}</div>,
      cell: ({ row }) => {
        const emp = row.original
        return (
          <div className="flex items-center justify-center gap-1">
            <ActionButton variant="view" label={tCommon('actions.view')} onClick={() => onView?.(emp)} />
            <ActionButton variant="edit" label={tCommon('actions.edit')} onClick={() => onEdit?.(emp)} />
            <ActionButton
              variant={emp.active ? 'archive' : 'restore'}
              label={emp.active ? tCommon('actions.archive') : tCommon('actions.restore')}
              onClick={() => onDelete?.(emp)}
            />
          </div>
        )
      }
    }
  ]
}
