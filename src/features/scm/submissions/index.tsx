/**
 * index.tsx — Partner Submission review feature for SCM staff
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { PageHeader } from '@/components/shared/page-header'

import { SubmissionsTable } from './table'

import type { ReactElement } from 'react'

export function SubmissionsFeature(): ReactElement {
  const t = useTranslations('scm.submissions')

  return (
    <div className="space-y-4 sm:space-y-6">
      <Breadcrumbs />
      <PageHeader title={t('title')} description={t('subtitle')} icon={FileText} />
      <SectionCard>
        <SubmissionsTable />
      </SectionCard>
    </div>
  )
}
