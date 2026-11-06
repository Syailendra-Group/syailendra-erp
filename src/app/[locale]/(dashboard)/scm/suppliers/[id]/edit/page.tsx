'use client'

import { use } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'

import { useSupplierDetail } from '@/hooks/scm/use-suppliers'
import { SupplierForm } from '@/features/scm/suppliers/form'

interface PageProps {
  params: Promise<{
    locale: string
    id: string
  }>
}

export default function SupplierEditPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const id = Number(resolvedParams.id)
  const tCommon = useTranslations('common')
  const { data: supplier, isLoading } = useSupplierDetail(id)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{tCommon('status.loading')}</span>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
        Supplier record not found
      </div>
    )
  }

  return <SupplierForm initialData={supplier} isEdit={true} />
}
