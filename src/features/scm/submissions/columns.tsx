/**
 * columns.tsx — TanStack Table column definitions for Partner Submission review
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { ColumnDef } from '@tanstack/react-table'

import { ActionButton } from '@/components/button/action-button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { StatusBadge } from '@/components/shared/data-badge'

import type { SubmissionRecord } from '@/types/scm/submission'

export interface SubmissionColumnsProps {
  t: (key: string, values?: Record<string, string | number>) => string
  locale: string
  onReview: (item: SubmissionRecord) => void
}

const STATE_VARIANTS: Record<string, 'success' | 'warning' | 'info' | 'destructive' | 'neutral'> = {
  draft: 'neutral',
  submitted: 'info',
  in_review: 'warning',
  needs_revision: 'warning',
  approved: 'success',
  rejected: 'destructive',
  cancelled: 'neutral'
}

const KIND_VARIANTS: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'destructive' | 'neutral'> = {
  petani: 'info',
  panen: 'success',
  serah_terima: 'primary',
  distilasi: 'warning',
  kirim: 'neutral'
}

export function getSubmissionColumns({ t, locale, onReview }: SubmissionColumnsProps): ColumnDef<SubmissionRecord>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.referenceNo')} />,
      cell: ({ row }) => <span className="text-primary font-mono text-xs font-semibold">{row.original.name}</span>,
      enableSorting: true
    },
    {
      accessorKey: 'partnerName',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.partnerName')} />,
      cell: ({ row }) => <span className="text-foreground truncate text-xs font-medium">{row.original.partnerName || '—'}</span>,
      enableSorting: true
    },
    {
      accessorKey: 'kind',
      header: () => <span className="text-xs">{t('table.columns.kind')}</span>,
      cell: ({ row }) => <StatusBadge variant={KIND_VARIANTS[row.original.kind] ?? 'neutral'}>{t(`table.kinds.${row.original.kind}`)}</StatusBadge>,
      enableSorting: false
    },
    {
      accessorKey: 'state',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.state')} />,
      cell: ({ row }) => (
        <StatusBadge variant={STATE_VARIANTS[row.original.state] ?? 'neutral'}>{t(`table.states.${row.original.state}`)}</StatusBadge>
      ),
      enableSorting: false
    },
    {
      accessorKey: 'submittedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.submittedAt')} />,
      cell: ({ row }) => {
        if (!row.original.submittedAt) return <span className="text-muted-foreground text-xs">—</span>
        return (
          <span className="font-mono text-xs">
            {new Date(row.original.submittedAt).toLocaleString(locale === 'en' ? 'en-US' : 'id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        )
      },
      enableSorting: true
    },
    {
      id: 'actions',
      header: () => <div className="text-center text-xs">{t('table.columns.review')}</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <ActionButton variant="custom" label={t('table.actions.review')} onClick={() => onReview(row.original)} />
        </div>
      ),
      enableSorting: false
    }
  ]
}
