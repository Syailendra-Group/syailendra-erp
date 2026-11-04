'use client'

import { Factory } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { DistillersProvider } from '@/contexts/scm/distiller.context'

import { DistillersDialogs } from './dialogs'
import { DistillersActionDialog } from './form'
import { DistillersPrimaryButtons } from './primary-buttons'
import { DistillersTable } from './table'

import type { ReactElement } from 'react'

export function DistillersFeature(): ReactElement {
  const tTrace = useTranslations('scm.distillers')

  return (
    <DistillersProvider>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader title={tTrace('title')} description={tTrace('subtitle')} icon={Factory} actions={<DistillersPrimaryButtons />} />

        {/* Data Table with URL state and server-side TanStack Query */}
        <DistillersTable />

        {/* Modals & Dialogs */}
        <DistillersActionDialog />
        <DistillersDialogs />
      </div>
    </DistillersProvider>
  )
}
