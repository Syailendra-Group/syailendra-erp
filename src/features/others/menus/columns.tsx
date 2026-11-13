'use client'

import { Factory, Leaf, ShieldCheck, Target } from 'lucide-react'

import { ActionButton } from '@/components/button/action-button'
import { DropdownSelect } from '@/components/button/dropdown-select'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { LongText, PrimaryText } from '@/components/text'
import { PILLAR_ICONS } from '@/data/pillar-catalog'

import type { DropdownSelectOption } from '@/components/button/dropdown-select'
import type { PillarRecord } from '@/types/others/menu'
import type { ColumnDef } from '@tanstack/react-table'
import type { ComponentType } from 'react'

const COMPANY_ICONS: Record<number, ComponentType<{ className?: string }>> = {
  4: Leaf,
  1: ShieldCheck,
  2: Factory,
  3: Target
}

export interface GetColumnsOptions {
  t: (key: string) => string
  tCommon: (key: string) => string
  companies: { id: number; short_name: string; name: string }[]
  onView: (pillar: PillarRecord) => void
  onEdit: (pillar: PillarRecord) => void
  onReassign: (pillarId: number, companyId: number) => void
}

export function getColumns({ t, tCommon, companies, onView, onEdit, onReassign }: GetColumnsOptions): ColumnDef<PillarRecord>[] {
  const companyOptions: DropdownSelectOption<number>[] = companies.map((c) => ({
    value: c.id,
    title: c.short_name,
    icon: COMPANY_ICONS[c.id] || ShieldCheck
  }))

  return [
    {
      accessorKey: 'sequence',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.sequence')} />,
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.sequence}</span>,
      enableSorting: true
    },
    {
      accessorKey: 'short_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.shortName')} />,
      cell: ({ row }) => {
        const item = row.original
        const Icon = PILLAR_ICONS[item.code]
        return (
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md border">
              {Icon && <Icon className="size-4" />}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold">{item.short_name}</span>
              <span className="text-muted-foreground font-mono text-[10px] uppercase">{item.code}</span>
            </div>
          </div>
        )
      },
      enableSorting: true
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.name')} />,
      cell: ({ row }) => (
        <div className="max-w-64 space-y-0.5">
          <PrimaryText className="text-xs font-semibold">{row.original.name}</PrimaryText>
          {row.original.tagline && <p className="text-muted-foreground truncate text-[11px] italic">{row.original.tagline}</p>}
        </div>
      ),
      enableSorting: true
    },
    {
      accessorKey: 'description',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.description')} />,
      cell: ({ row }) => (
        <LongText className="text-muted-foreground block max-w-72 text-xs leading-relaxed">{row.original.description || '-'}</LongText>
      )
    },
    {
      accessorKey: 'company_id',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.owner')} />,
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
      cell: ({ row }) => {
        const item = row.original
        return (
          <DropdownSelect<number>
            options={companyOptions}
            value={item.company_id}
            onValueChange={(newCompanyId) => onReassign(item.id, newCompanyId)}
            triggerBadge={item.company_short_name}
            menuLabel={t('table.owner')}
            contentClassName="w-48"
          />
        )
      },
      enableSorting: true
    },
    {
      id: 'actions',
      header: () => <div className="text-center text-xs font-semibold">{tCommon('table.actions')}</div>,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center justify-center gap-1">
            <ActionButton variant="view" label={tCommon('actions.view')} onClick={() => onView(item)} />
            <ActionButton variant="edit" label={tCommon('actions.edit')} onClick={() => onEdit(item)} />
          </div>
        )
      }
    }
  ]
}
