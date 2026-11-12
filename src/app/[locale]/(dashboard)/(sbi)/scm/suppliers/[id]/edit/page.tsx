'use client'

import { use } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SupplierForm } from '@/features/sbi/scm/suppliers/form'
import { useSupplierDetail } from '@/hooks/sbi/scm/use-suppliers'

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
      <div className="text-muted-foreground flex h-64 items-center justify-center gap-2 text-xs">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{tCommon('status.loading')}</span>
      </div>
    )
  }

  if (!supplier) {
    return <div className="text-muted-foreground flex h-64 items-center justify-center text-xs">Supplier record not found</div>
  }

  return <SupplierForm initialData={supplier} isEdit={true} />
}
