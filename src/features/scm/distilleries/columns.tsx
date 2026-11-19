'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Building2, Flame, Gauge, MapPin, User } from 'lucide-react'

import { ActionButton } from '@/components/button/action-button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { StatusBadge } from '@/components/shared/data-badge'
import { IconText, LongText, PrimaryText } from '@/components/text'
import { Badge } from '@/components/ui/badge'

import type { DistilleryRecord } from '@/types/scm/distillery'

export interface GetColumnsOptions {
  t: (key: string) => string
  tCommon: (key: string) => string
  onView?: (item: DistilleryRecord) => void
  onEdit?: (item: DistilleryRecord) => void
  onDelete?: (item: DistilleryRecord) => void
}

export function getColumns({ t, tCommon, onView, onEdit, onDelete }: GetColumnsOptions): ColumnDef<DistilleryRecord>[] {
  return [
    {
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.code')} />,
      cell: ({ row }) => <PrimaryText fallback="-">{row.original.code}</PrimaryText>,
      enableSorting: true
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.name')} />,
      cell: ({ row }) => (
        <IconText icon={Building2} className="max-w-55 text-xs font-semibold">
          <LongText>{row.original.name}</LongText>
        </IconText>
      ),
      enableSorting: true
    },
    {
      id: 'partner_id',
      accessorKey: 'partnerName',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.partner')} />,
      cell: ({ row }) => (
        <IconText icon={User} className="max-w-45 text-xs">
          <LongText>{row.original.partnerName || '-'}</LongText>
        </IconText>
      ),
      enableSorting: true
    },
    {
      id: 'distillation_method',
      accessorKey: 'distillationMethod',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.method')} />,
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] font-normal">
          <IconText icon={Flame} iconClassName="text-amber-500 h-3 w-3">
            {t(`methods.${row.original.distillationMethod}`)}
          </IconText>
        </Badge>
      ),
      enableSorting: true
    },
    {
      id: 'boiler_capacity_kg',
      accessorKey: 'boilerCapacityKg',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.capacity')} />,
      cell: ({ row }) => (
        <IconText icon={Gauge} mono className="text-muted-foreground">
          {row.original.boilerCapacityKg ? `${row.original.boilerCapacityKg} Kg` : '-'}
        </IconText>
      ),
      enableSorting: true
    },
    {
      id: 'city_id',
      accessorKey: 'cityName',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.location')} />,
      cell: ({ row }) => (
        <IconText icon={MapPin} className="text-muted-foreground max-w-45 text-xs">
          <LongText>{row.original.cityName || '-'}</LongText>
        </IconText>
      )
    },
    {
      accessorKey: 'active',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tCommon('status.title')} />,
      cell: ({ row }) => (
        <StatusBadge variant={row.original.active ? 'success' : 'neutral'} size="sm">
          {row.original.active ? tCommon('status.operational') : tCommon('status.maintenance')}
        </StatusBadge>
      ),
      enableSorting: true
    },
    {
      id: 'actions',
      header: () => <div className="text-center">{tCommon('table.actions')}</div>,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center justify-center gap-1">
            <ActionButton variant="view" label={tCommon('actions.view')} onClick={() => onView?.(item)} />
            <ActionButton variant="edit" label={tCommon('actions.edit')} onClick={() => onEdit?.(item)} />
            <ActionButton variant="delete" label={tCommon('actions.delete')} onClick={() => onDelete?.(item)} />
          </div>
        )
      }
    }
  ]
}
