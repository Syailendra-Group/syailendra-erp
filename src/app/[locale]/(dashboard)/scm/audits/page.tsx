'use client'

import { Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { InfoAlert } from '@/components/shared/info-alert'
import { PageHeader } from '@/components/shared/page-header'

export default function ScmAuditsPage() {
  const t = useTranslations('nav.items')
  const tStatus = useTranslations('scm.comingSoon')

  return (
    <div className="space-y-6">
      <PageHeader title={t('audits')} description={tStatus('subtitle')} icon={Shield} />
      <InfoAlert variant="info" title={tStatus('title')} description={tStatus('description')} />
    </div>
  )
}
