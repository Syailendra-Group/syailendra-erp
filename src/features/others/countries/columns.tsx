'use client'

import { Edit, Eye, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { CountryRecord } from '@/types/others/country'
import type { ColumnDef } from '@tanstack/react-table'

export interface GetColumnsProps {
  t: (key: string) => string
  tCommon?: (key: string) => string
  onView: (country: CountryRecord) => void
  onEdit: (country: CountryRecord) => void
  onDelete: (country: CountryRecord) => void
}

export function getColumns({ t, onView, onEdit, onDelete }: GetColumnsProps): ColumnDef<CountryRecord>[] {
  return [
    {
      accessorKey: 'code',
      header: t('table.code'),
      cell: ({ row }) => <span className="font-mono text-xs font-bold">{row.original.code}</span>
    },
    {
      accessorKey: 'name',
      header: t('table.name'),
      cell: ({ row }) => <span className="text-foreground text-xs font-semibold">{row.original.name}</span>
    },
    {
      accessorKey: 'phone_code',
      header: 'Kode Telepon',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-xs">{row.original.phone_code ? `+${row.original.phone_code}` : '-'}</span>
      )
    },
    {
      accessorKey: 'currency_id',
      header: t('table.currency'),
      cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.currency_id ? row.original.currency_id[1] : '-'}</span>
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground size-7"
            onClick={() => onView(row.original)}
            title="View"
          >
            <Eye className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground size-7"
            onClick={() => onEdit(row.original)}
            title="Edit"
          >
            <Edit className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 size-7"
            onClick={() => onDelete(row.original)}
            title="Delete"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      )
    }
  ]
}
