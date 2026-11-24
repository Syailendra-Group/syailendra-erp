'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Key, Mail, Phone } from 'lucide-react'

import { ActionButton } from '@/components/button/action-button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { EntityIdentityCell } from '@/components/image/entity-identity-cell'
import { StatusBadge } from '@/components/shared/data-badge'
import { IconText, LongText, PrimaryText } from '@/components/text'
import { Badge } from '@/components/ui/badge'
import { getCategoryBadgeSummary } from '@/utils/supplier-category'

import type { PartnerAccessSummary } from '@/types/scm/partner-access'
import type { SupplierRecord } from '@/types/scm/supplier'

export interface SupplierColumnsProps {
  t: (key: string, values?: Record<string, string | number>) => string
  tCommon: (key: string) => string
  onView: (item: SupplierRecord) => void
  onEdit: (item: SupplierRecord) => void
  onToggleStatus: (item: SupplierRecord) => void
  pinStatusMap: Map<number, PartnerAccessSummary>
  onIssuePin: (item: SupplierRecord) => void
}

export function getSupplierColumns({
  t,
  tCommon,
  onView,
  onEdit,
  onToggleStatus,
  pinStatusMap,
  onIssuePin
}: SupplierColumnsProps): ColumnDef<SupplierRecord>[] {
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
        return <EntityIdentityCell name={item.name} secondary={item.picName || item.supplierTypeName} imageUrl={item.imageUrl} className="max-w-60" />
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
        const { primary, overflow, labels } = getCategoryBadgeSummary(row.original.categoryTags)
        if (!primary) {
          return <span className="text-muted-foreground text-xs">-</span>
        }

        return (
          <div className="flex max-w-55 items-center gap-1.5">
            <Badge variant="secondary" className="max-w-40 px-1.5 py-0 text-[10px] font-normal">
              <LongText>{primary}</LongText>
            </Badge>
            {overflow > 0 && (
              <span className="text-muted-foreground shrink-0 text-[10px] font-medium" title={labels.join(', ')}>
                {t('table.categoryOverflow', { count: overflow })}
              </span>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: 'mobile',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.contact')} />,
      cell: ({ row }) => {
        const phone = row.original.mobile || row.original.phone
        const email = row.original.email
        if (!phone && !email) return <span className="text-muted-foreground text-xs">-</span>
        return (
          <div className="flex max-w-55 flex-col gap-0.5">
            {phone && (
              <IconText icon={Phone} mono className="text-muted-foreground">
                <LongText>{phone}</LongText>
              </IconText>
            )}
            {email && (
              <IconText icon={Mail} className="text-muted-foreground text-[11px]">
                <LongText>{email}</LongText>
              </IconText>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: 'location',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.location')} />,
      cell: ({ row }) => {
        const item = row.original
        const loc = [item.cityName || item.city, item.stateName].filter(Boolean).join(', ')
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
      accessorKey: 'active',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.status')} />,
      cell: ({ row }) => {
        const active = row.original.active
        return (
          <StatusBadge variant={active ? 'success' : 'neutral'} size="sm">
            {active ? tCommon('status.active') : tCommon('status.archived')}
          </StatusBadge>
        )
      },
      enableSorting: true
    },
    {
      id: 'pinStatus',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.pinStatus')} />,
      cell: ({ row }) => {
        const item = row.original
        const summary = pinStatusMap.get(item.id)
        if (!summary || !summary.hasAccess) {
          return (
            <StatusBadge variant="neutral" size="sm">
              {t('table.pinStatusDetail.noAccess')}
            </StatusBadge>
          )
        }
        const variant = summary.pinStatus === 'active' ? 'success' : summary.pinStatus === 'must-change' ? 'warning' : 'destructive'
        const label =
          summary.pinStatus === 'active'
            ? t('table.pinStatusDetail.active')
            : summary.pinStatus === 'must-change'
              ? t('table.pinStatusDetail.mustChange')
              : t('table.pinStatusDetail.locked')
        return (
          <StatusBadge
            variant={variant}
            size="sm"
            title={summary.lastLoginAt ? t('table.pinStatusDetail.lastLogin', { date: summary.lastLoginAt }) : undefined}
          >
            {label}
          </StatusBadge>
        )
      }
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
            <ActionButton variant="custom" icon={Key} label={t('actions.issuePin')} onClick={() => onIssuePin(item)} className="size-7" />
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
