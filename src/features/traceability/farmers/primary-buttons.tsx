'use client'

import { UserPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'

import { useFarmers } from './context'

import type { ReactElement } from 'react'

export function FarmersPrimaryButtons(): ReactElement {
  const tTrace = useTranslations('traceability.farmers')
  const { setOpen, setCurrentRow } = useFarmers()

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="cursor-pointer gap-1.5 text-xs font-semibold"
        onClick={() => {
          setCurrentRow(null)
          setOpen('add')
        }}
      >
        <UserPlus className="size-3.5" />
        <span>{tTrace('primaryAction')}</span>
      </Button>
    </div>
  )
}
