'use client'

import { UserPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { LinkButton } from '@/components/button/link-button'

import type { ReactElement } from 'react'

export function FarmersPrimaryButtons(): ReactElement {
  const tTrace = useTranslations('traceability.farmers')

  return (
    <div className="flex items-center gap-2">
      <LinkButton href="/traceability/farmers/create" icon={UserPlus} label={tTrace('primaryAction')} />
    </div>
  )
}
