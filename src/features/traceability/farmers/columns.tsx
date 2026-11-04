'use client'

import { Edit, Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

import type { FarmerRecord } from '@/types/traceability/farmer'
import type { ColumnDef } from '@tanstack/react-table'

export interface GetColumnsProps {
  tTrace: (key: string) => string
  tCommon: (key: string) => string
}

export function getColumns({ tTrace }: GetColumnsProps): ColumnDef<FarmerRecord>[] {
  return [
    {
      accessorKey: 'ref',
      header: tTrace('table.ref'),
      cell: ({ row }) => <span className="text-foreground font-mono text-xs font-bold">{row.original.ref}</span>
    },
    {
      accessorKey: 'name',
      header: tTrace('table.name'),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-foreground text-xs font-semibold">{row.original.name}</span>
          <span className="text-muted-foreground text-[11px]">{row.original.street}</span>
        </div>
      )
    },
    {
      accessorKey: 'commodity',
      header: tTrace('table.commodity'),
      cell: ({ row }) => (
        <span className="bg-primary/10 text-primary inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium capitalize">
          {row.original.commodity || 'gaharu'}
        </span>
      )
    },
    {
      accessorKey: 'city',
      header: tTrace('table.location'),
      cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.city}</span>
    },
    {
      accessorKey: 'active',
      header: tTrace('table.status'),
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
            row.original.active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
          }`}
        >
          {row.original.active ? 'Aktif' : 'Diarsipkan'}
        </span>
      )
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground size-7" asChild>
            <Link href={`/traceability/farmers/${row.original.id}`} title="View">
              <Eye className="size-3.5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground size-7" asChild>
            <Link href={`/traceability/farmers/${row.original.id}/edit`} title="Edit">
              <Edit className="size-3.5" />
            </Link>
          </Button>
        </div>
      )
    }
  ]
}
