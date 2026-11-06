/**
 * columns.tsx — TanStack Table columns for Master Supplier
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Building2, Phone, User } from 'lucide-react'

import { ActionButton } from '@/components/button/action-button'
import { Badge } from '@/components/ui/badge'

import type { SupplierRecord } from '@/types/scm/supplier'

interface ColumnsProps {
  t: (key: string, values?: Record<string, string | number>) => string
  onView: (item: SupplierRecord) => void
  onEdit: (item: SupplierRecord) => void
  onToggleStatus: (item: SupplierRecord) => void
}

export function getSupplierColumns({ t, onView, onEdit, onToggleStatus }: ColumnsProps): ColumnDef<SupplierRecord>[] {
  return [
    {
      accessorKey: 'ref',
      header: t('table.columns.ref'),
      cell: ({ row }) => <span className="text-primary font-mono text-xs font-semibold">{row.original.ref}</span>
    },
    {
      accessorKey: 'name',
      header: t('table.columns.name'),
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              {item.isCompany ? (
                <Building2 className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              ) : (
                <User className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              )}
              <span>{item.name}</span>
            </div>
            {item.contactName && <span className="text-muted-foreground text-[10px]">PIC: {item.contactName}</span>}
          </div>
        )
      }
    },
    {
      id: 'categoryIds',
      accessorKey: 'categoryNames',
      header: t('table.columns.categories'),
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
          <div className="flex max-w-[220px] flex-wrap gap-1">
            {cats.slice(0, 2).map((catName) => {
              const cleanName = catName.includes('/') ? catName.split('/').pop()?.trim() || catName : catName
              return (
                <Badge key={catName} variant="secondary" className="px-1.5 py-0 text-[10px] font-normal whitespace-nowrap">
                  {cleanName}
                </Badge>
              )
            })}
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
      accessorKey: 'mobile',
      header: t('table.columns.contact'),
      cell: ({ row }) => {
        const phone = row.original.mobile || row.original.phone
        if (!phone) return <span className="text-muted-foreground text-xs">-</span>
        return (
          <div className="text-muted-foreground flex items-center gap-1 font-mono text-xs">
            <Phone className="h-3 w-3 shrink-0" />
            <span>{phone}</span>
          </div>
        )
      }
    },
    {
      accessorKey: 'location',
      header: t('table.columns.location'),
      cell: ({ row }) => {
        const item = row.original
        const loc = [item.districtName, item.stateName].filter(Boolean).join(', ')
        return <span className="text-muted-foreground text-xs">{loc || '-'}</span>
      }
    },
    {
      accessorKey: 'paymentTerm',
      header: t('table.columns.paymentTerm'),
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
      header: t('table.columns.status'),
      cell: ({ row }) => {
        const active = row.original.active
        return (
          <Badge variant={active ? 'default' : 'outline'} className="text-[10px]">
            {active ? t('table.status.active') : t('table.status.archived')}
          </Badge>
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
