'use client'

import { Plus, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { FarmersProvider } from '@/contexts/traceability/farmer.context'
import { Link } from '@/i18n/navigation'

import { FarmersTable } from './table'

import type { ReactElement } from 'react'

function FarmersPrimaryButtons(): ReactElement {
  const tTrace = useTranslations('traceability.farmers')
  return (
    <Button asChild className="gap-2 font-semibold">
      <Link href="/traceability/farmers/create">
        <Plus className="size-4" />
        <span>{tTrace('primaryAction')}</span>
      </Link>
    </Button>
  )
}

function FarmersContent(): ReactElement {
  const tTrace = useTranslations('traceability.farmers')

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={tTrace('title')} description={tTrace('subtitle')} icon={Users} actions={<FarmersPrimaryButtons />} />
      <FarmersTable />
    </div>
  )
}

export function FarmersFeature(): ReactElement {
  return (
    <FarmersProvider>
      <FarmersContent />
    </FarmersProvider>
  )
}
