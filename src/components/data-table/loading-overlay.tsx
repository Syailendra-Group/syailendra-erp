/**
 * loading-overlay.tsx — Reusable transition backdrop overlay for datatables
 * Syailendra Group ERP
 */

'use client'

import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'

import type { ReactElement } from 'react'

export interface DataTableLoadingOverlayProps {
  isUpdating: boolean
  text?: string
  className?: string
}

export function DataTableLoadingOverlay({ isUpdating, text, className }: DataTableLoadingOverlayProps): ReactElement | null {
  const t = useTranslations('common')

  if (!isUpdating) return null

  return (
    <div
      className={cn(
        'bg-background/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[1px] transition-all duration-200',
        className
      )}
    >
      <span className="text-muted-foreground text-xs font-medium tracking-wide">{text || t('status.loading')}</span>
    </div>
  )
}
