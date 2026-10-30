'use client'

import { UserPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

import type { ReactElement } from 'react'

export function FarmersPrimaryButtons(): ReactElement {
  const tTrace = useTranslations('traceability.farmers')

  return (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" className="gap-1.5 text-xs font-semibold">
        <Link href="/traceability/farmers/create">
          <UserPlus className="size-3.5" />
          <span>{tTrace('primaryAction')}</span>
        </Link>
      </Button>
    </div>
  )
}
