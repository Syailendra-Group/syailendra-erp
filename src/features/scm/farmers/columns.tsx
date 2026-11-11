'use client'

import { MessageSquare, Phone, Sprout, User } from 'lucide-react'

import { ActionButton } from '@/components/button/action-button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { CopyableText, CoordsLink, IconText, LinkText, LongText, PrimaryText } from '@/components/text'
import { Badge } from '@/components/ui/badge'

import type { FarmerRecord } from '@/types/scm/farmer'
import type { ColumnDef } from '@tanstack/react-table'

export interface GetColumnsOptions {
  t?: (key: string) => string
  tTrace?: (key: string) => string
  tCommon: (key: string) => string
  onView?: (farmer: FarmerRecord) => void
  onEdit?: (farmer: FarmerRecord) => void
  onDelete?: (farmer: FarmerRecord) => void
}

export function getColumns({ t: tProp, tTrace, tCommon, onView, onEdit, onDelete }: GetColumnsOptions): ColumnDef<FarmerRecord>[] {
  const t = (tProp || tTrace)!

  return [
    {
      accessorKey: 'ref',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.ref') || 'Farmer ID'} />,
      cell: ({ row }) =>
        row.original.ref ? (
          <CopyableText text={row.original.ref} className="text-primary font-bold tracking-tight" />
        ) : (
          <PrimaryText fallback="-">{row.original.ref}</PrimaryText>
        ),
      enableSorting: true
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.name')} />,
      cell: ({ row }) => (
        <IconText icon={User} className="max-w-55 text-xs font-semibold">
          <LongText>{row.original.name}</LongText>
        </IconText>
      ),
      enableSorting: true
    },
    {
      accessorKey: 'commodity',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.commodity')} />,
      cell: ({ row }) => {
        const item = row.original
        const commKey = item.commodity || 'gaharu'
        const methodKey = item.farming_method || 'organic'
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="gap-1 border-primary/20 bg-primary/10 text-primary px-1.5 py-0 text-[11px] font-medium">
                <Sprout className="size-3" />
                <span>{t(`commodities.${commKey}`)}</span>
              </Badge>
            </div>
            <span className="text-muted-foreground text-[10px] capitalize">
              {t(`methods.${methodKey}`)}
            </span>
          </div>
        )
      }
    },
    {
      accessorKey: 'land_area_m2',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.landArea')} />,
      cell: ({ row }) => {
        const m2 = row.original.land_area_m2
        if (!m2) return <span className="text-muted-foreground text-xs">-</span>
        const ha = (m2 / 10000).toFixed(2)
        return (
          <div className="flex flex-col font-mono text-xs">
            <span className="font-semibold">{m2.toLocaleString()} m²</span>
            <span className="text-muted-foreground text-[10px]">({ha} Ha)</span>
          </div>
        )
      },
      enableSorting: true
    },
    {
      accessorKey: 'city',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.location')} />,
      cell: ({ row }) => {
        const item = row.original
        const cityName = item.city_id && Array.isArray(item.city_id) ? item.city_id[1] : item.city
        const stateName = item.state_id && Array.isArray(item.state_id) ? item.state_id[1] : ''
        const loc = [cityName, stateName].filter(Boolean).join(', ')
        return <LongText className="text-muted-foreground block max-w-45 text-xs">{loc || '-'}</LongText>
      }
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.phone')} />,
      cell: ({ row }) => {
        const phone = row.original.phone
        if (!phone) return <span className="text-muted-foreground text-xs">-</span>
        const cleanPhone = phone.replace(/[^0-9]/g, '')
        const waUrl = cleanPhone.startsWith('0') ? `https://wa.me/62${cleanPhone.slice(1)}` : `https://wa.me/${cleanPhone}`
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <LinkText href={`tel:${cleanPhone}`} icon={Phone} mono>
              {phone}
            </LinkText>
            {cleanPhone && (
              <LinkText href={waUrl} external icon={MessageSquare} title="Chat WhatsApp" className="text-primary" />
            )}
          </div>
        )
      }
    },
    {
      accessorKey: 'partner_latitude',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.coordinates')} />,
      cell: ({ row }) => <CoordsLink lat={row.original.partner_latitude} lng={row.original.partner_longitude} />
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
