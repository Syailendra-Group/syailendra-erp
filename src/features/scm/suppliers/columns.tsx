'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Building2, Phone, User } from 'lucide-react'

import { ActionButton } from '@/components/button/action-button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { StatusBadge } from '@/components/shared/data-badge'
import { IconText, LongText, PrimaryText } from '@/components/text'
import { Badge } from '@/components/ui/badge'

import type { SupplierRecord } from '@/types/scm/supplier'

export interface SupplierColumnsProps {
  t: (key: string, values?: Record<string, string | number>) => string
  onView: (item: SupplierRecord) => void
  onEdit: (item: SupplierRecord) => void
  onToggleStatus: (item: SupplierRecord) => void
}

export function getSupplierColumns({ t, onView, onEdit, onToggleStatus }: SupplierColumnsProps): ColumnDef<SupplierRecord>[] {
  return [
    {
      accessorKey: 'ref',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.ref')} />,
      cell: ({ row }) => <PrimaryText fallback="-">{row.original.ref}</PrimaryText>,
      enableSorting: true
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.name')} />,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex max-w-60 flex-col gap-0.5">
            <IconText icon={item.isCompany ? Building2 : User} className="text-xs font-medium">
              <LongText>{item.name}</LongText>
            </IconText>
            {item.contactName && <span className="text-muted-foreground truncate pl-5 text-[10px]">PIC: {item.contactName}</span>}
          </div>
        )
      },
      enableSorting: true
    },
    {
      id: 'categoryIds',
      accessorKey: 'categoryNames',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.categories')} />,
      filterFn: (row, id, filterValues: string[]) => {
        if (!filterValues || filterValues.length === 0) return true
        const catIds = row.original.categoryIds || []
        return filterValues.some((val) => catIds.includes(Number(val)))
      },
      cell: ({ row }) => {
        const cats = row.original.categoryNames
        if (!cats || cats.length === 0) {
          return <span className="text-muted-foreground text-xs">-</span>
        }

        return (
          <div className="flex max-w-55 flex-wrap gap-1">
            {cats.slice(0, 2).map((catName) => (
              <Badge key={catName} variant="secondary" className="px-1.5 py-0 text-[10px] font-normal whitespace-nowrap">
                <LongText>{catName}</LongText>
              </Badge>
            ))}
            {cats.length > 2 && (
              <Badge variant="outline" className="text-muted-foreground px-1 py-0 font-mono text-[10px]">
                +{cats.length - 2}
              </Badge>
            )}
          </div>
        )
      }
    },
    {
      id: 'supplierTypeId',
      accessorKey: 'supplierTypeName',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.supplierType')} />,
      filterFn: (row, id, filterValues: string[]) => {
        if (!filterValues || filterValues.length === 0) return true
        return filterValues.includes(String(row.original.supplierTypeId ?? ''))
      },
      cell: ({ row }) => {
        const typeName = row.original.supplierTypeName
        if (!typeName) return <span className="text-muted-foreground text-xs">-</span>
        return (
          <Badge variant="outline" className="max-w-45 px-1.5 py-0 text-[10px] font-normal">
            <LongText>{typeName}</LongText>
          </Badge>
        )
      }
    },
    {
      id: 'needsReview',
      accessorKey: 'needsReview',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.needsReview')} />,
      filterFn: (row, id, filterValues: string[]) => {
        if (!filterValues || filterValues.length === 0) return true
        return filterValues.includes(row.original.needsReview ? 'review' : 'verified')
      },
      cell: ({ row }) => {
        const needsReview = row.original.needsReview
        return (
          <StatusBadge variant={needsReview ? 'warning' : 'success'} size="sm">
            {needsReview ? t('table.review.pending') : t('table.review.verified')}
          </StatusBadge>
        )
      }
    },
    {
      accessorKey: 'mobile',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.contact')} />,
      cell: ({ row }) => {
        const phone = row.original.mobile || row.original.phone
        if (!phone) return <span className="text-muted-foreground text-xs">-</span>
        return (
          <IconText icon={Phone} mono className="text-muted-foreground">
            <LongText>{phone}</LongText>
          </IconText>
        )
      }
    },
    {
      accessorKey: 'location',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.location')} />,
      cell: ({ row }) => {
        const item = row.original
        const loc = [item.districtName, item.stateName].filter(Boolean).join(', ')
        return (
          <span className="text-muted-foreground block max-w-45 text-xs">
            <LongText>{loc || '-'}</LongText>
          </span>
        )
      }
    },
    {
      accessorKey: 'paymentTerm',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.paymentTerm')} />,
      cell: ({ row }) => {
        const term = row.original.paymentTerm
        return (
          <Badge variant="outline" className="font-mono text-[10px]">
            {term === 'COD' ? 'COD' : 'ADVANCE'}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'active',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.status')} />,
      cell: ({ row }) => {
        const active = row.original.active
        return (
          <StatusBadge variant={active ? 'success' : 'neutral'} size="sm">
            {active ? t('table.status.active') : t('table.status.archived')}
          </StatusBadge>
        )
      },
      enableSorting: true
    },
    {
      id: 'actions',
      header: () => <div className="text-center">{t('table.columns.actions')}</div>,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center justify-center gap-1">
            <ActionButton variant="view" label={t('actions.view')} onClick={() => onView(item)} />
            <ActionButton variant="edit" label={t('actions.edit')} onClick={() => onEdit(item)} />
            <ActionButton
              variant={item.active ? 'archive' : 'restore'}
              label={item.active ? t('actions.archive') : t('actions.restore')}
              onClick={() => onToggleStatus(item)}
            />
          </div>
        )
      }
    }
  ]
}
