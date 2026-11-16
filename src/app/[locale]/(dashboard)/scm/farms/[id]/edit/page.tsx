'use client'

import { use } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { FarmForm } from '@/features/scm/farms/form'
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
  const tCommon = useTranslations('common')
  const t = useTranslations('scm.farms')
  const { data: farm, isLoading } = useFarmDetail(id)

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex h-64 items-center justify-center gap-2 text-xs">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{tCommon('status.loading')}</span>
      </div>
    )
  }

  if (!farm) {
    return <div className="text-muted-foreground flex h-64 items-center justify-center text-xs">{t('detail.notFound')}</div>
  }

  return <FarmForm initialData={farm} />
}
