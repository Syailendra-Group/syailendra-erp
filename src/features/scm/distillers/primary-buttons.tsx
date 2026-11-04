'use client'

import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { useDistillers } from '@/contexts/scm/distiller.context'

import type { ReactElement } from 'react'

export function DistillersPrimaryButtons(): ReactElement {
  const tTrace = useTranslations('scm.distillers')
  const { setOpen, setCurrentRow } = useDistillers()

  return (
    <div className="flex items-center gap-2">
      <Button
        className="cursor-pointer gap-1.5 text-xs font-semibold"
        onClick={() => {
          setCurrentRow(null)
          setOpen('add')
        }}
      >
        <Plus className="size-3.5" />
        <span>{tTrace('primaryAction')}</span>
      </Button>
    </div>
  )
}
