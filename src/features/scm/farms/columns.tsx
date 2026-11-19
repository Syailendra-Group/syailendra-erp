'use client'

import { ColumnDef } from '@tanstack/react-table'
import { MapPin, Sprout } from 'lucide-react'

import { ActionButton } from '@/components/button/action-button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { StatusBadge } from '@/components/shared/data-badge'

import type { FarmRecord } from '@/types/scm/farm'

export interface FarmColumnsProps {
  t: (key: string, values?: Record<string, string | number>) => string
  tCommon: (key: string) => string
  commodityNames: Map<number, string>
  onView: (item: FarmRecord) => void
  onDelete: (item: FarmRecord) => void
}

export function getFarmColumns({ t, tCommon, commodityNames, onView, onDelete }: FarmColumnsProps): ColumnDef<FarmRecord>[] {
  return [
    {
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.code')} />,
      cell: ({ row }) => <span className="text-primary font-mono text-xs font-semibold">{row.original.code}</span>,
      enableSorting: true
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.name')} />,
      cell: ({ row }) => (
        <div className="flex max-w-55 flex-col">
          <span className="text-foreground truncate text-xs font-medium">{row.original.name}</span>
          <span className="text-muted-foreground truncate text-[11px]">{row.original.partnerName || '—'}</span>
        </div>
      ),
      enableSorting: true
    },
    {
      accessorKey: 'cropIds',
      header: () => <span className="text-xs">{t('table.columns.commodities')}</span>,
      cell: ({ row }) => {
        const names = row.original.cropIds.map((id) => commodityNames.get(id)).filter((name): name is string => Boolean(name))
        if (names.length === 0) return <span className="text-muted-foreground text-xs">—</span>
        return (
          <div className="flex max-w-50 flex-wrap gap-1">
            {names.slice(0, 2).map((name) => (
              <StatusBadge key={name} variant="info">
                <Sprout className="mr-1 size-3" />
                {name}
              </StatusBadge>
            ))}
            {names.length > 2 && <StatusBadge variant="neutral">+{names.length - 2}</StatusBadge>}
          </div>
        )
      },
      enableSorting: false
    },
    {
      accessorKey: 'stateName',
      header: () => <span className="text-xs">{t('table.columns.region')}</span>,
      cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.cityName || row.original.stateName || '—'}</span>,
      enableSorting: false
    },
    {
      accessorKey: 'areaHa',
      header: () => <span className="text-xs">{t('table.columns.areaHa')}</span>,
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.areaHa !== null ? `${row.original.areaHa.toLocaleString('id-ID')} Ha` : '—'}</span>
      ),
      enableSorting: false
    },
    {
      accessorKey: 'farmingSystem',
      header: () => <span className="text-xs">{t('table.columns.farmingSystem')}</span>,
      cell: ({ row }) => (
        <StatusBadge variant={row.original.farmingSystem === 'organic' ? 'success' : 'neutral'}>
          {t(`farmingSystems.${row.original.farmingSystem}`)}
        </StatusBadge>
      ),
      enableSorting: false
    },
    {
      accessorKey: 'googleMapsUrl',
      header: () => <span className="text-xs">{t('table.columns.geolocation')}</span>,
      cell: ({ row }) =>
        row.original.latitude !== null && row.original.longitude !== null ? (
          <a
            href={`https://www.google.com/maps?q=${row.original.latitude},${row.original.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="text-primary inline-flex items-center gap-1 font-mono text-[11px] hover:underline"
          >
            <MapPin className="size-3" />
            {row.original.latitude.toFixed(4)}, {row.original.longitude.toFixed(4)}
          </a>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
      enableSorting: false
    },
    {
      accessorKey: 'active',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.status')} />,
      cell: ({ row }) => (
        <StatusBadge variant={row.original.active ? 'success' : 'neutral'}>
          {row.original.active ? tCommon('status.active') : tCommon('status.inactive')}
        </StatusBadge>
      ),
      enableSorting: false
    },
    {
      id: 'actions',
      header: () => <div className="text-center text-xs">{t('table.columns.actions')}</div>,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center justify-center gap-1">
            <ActionButton variant="view" label={t('actions.view')} onClick={() => onView(item)} />
            <ActionButton variant="edit" label={t('actions.edit')} href={`/scm/farms/${item.id}/edit`} />
            <ActionButton variant="delete" label={t('actions.delete')} onClick={() => onDelete(item)} />
          </div>
        )
      }
    }
  ]
}
