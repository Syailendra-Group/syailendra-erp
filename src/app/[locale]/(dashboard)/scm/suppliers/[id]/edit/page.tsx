'use client'

import { use } from 'react'
import { useTranslations } from 'next-intl'

import { SupplierForm } from '@/features/scm/suppliers/form'
import { SupplierFormSkeleton } from '@/features/scm/suppliers/skeleton'
import { useSupplierDetail } from '@/hooks/scm/use-suppliers'

interface PageProps {
  params: Promise<{
    locale: string
    id: string
  }>
}

export default function SupplierEditPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const id = Number(resolvedParams.id)
  const t = useTranslations('scm.suppliers')
  const { data: supplier, isLoading } = useSupplierDetail(id)

  if (isLoading) {
    return <SupplierFormSkeleton />
  }

  if (!supplier) {
    return <div className="text-muted-foreground flex h-64 items-center justify-center text-xs">{t('detail.notFound')}</div>
  }

  return <SupplierForm initialData={supplier} isEdit={true} />
}
