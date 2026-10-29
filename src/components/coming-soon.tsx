'use client'

import { Telescope } from 'lucide-react'
import { useTranslations } from 'next-intl'

import type { ReactElement } from 'react'

export function ComingSoon(): ReactElement {
  const tComing = useTranslations('common.comingSoon')

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-8 text-center">
      <Telescope className="text-primary size-16 stroke-[1.5]" />
      <h2 className="text-2xl font-bold tracking-tight">{tComing('title')}</h2>
      <p className="text-muted-foreground max-w-md text-sm">{tComing('desc')}</p>
    </div>
  )
}
