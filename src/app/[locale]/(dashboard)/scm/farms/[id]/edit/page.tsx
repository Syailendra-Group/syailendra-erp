'use client'

import { use } from 'react'
import { useTranslations } from 'next-intl'

import { DataBadge } from '@/components/shared/data-badge'
import { PageHeader } from '@/components/shared/page-header'
import { FarmForm } from '@/features/scm/farms/form'
import { FarmFormSkeleton } from '@/features/scm/farms/skeleton'
import { useFarmDetail } from '@/hooks/scm/use-farms'

interface PageProps {
  params: Promise<{
    locale: string
    id: string
  }>
}

export default function FarmEditPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const id = Number(resolvedParams.id)
  const t = useTranslations('scm.farms')
  const { data: farm, isLoading } = useFarmDetail(id)

  if (isLoading) {
    return <FarmFormSkeleton />
  }

  if (!farm) {
    return (
      <div className="space-y-6">
        <PageHeader showBack backHref="/scm/farms" title={t('detail.notFound')} />
        <DataBadge variant="neutral">{t('detail.notFound')}</DataBadge>
      </div>
    )
  }

  return <FarmForm initialData={farm} />
}
