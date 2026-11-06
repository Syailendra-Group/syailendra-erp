'use client'

import { useRouter } from 'next/navigation'
import { Plus, Truck } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'

import { SupplierDialogs } from './dialogs'
import { SupplierProvider } from './supplier.context'
import { SuppliersTable } from './table'

function SupplierContent() {
  const router = useRouter()
  const t = useTranslations('scm.suppliers')

  const primaryActions = (
    <Button size="sm" onClick={() => router.push('/scm/suppliers/create')} className="h-8 cursor-pointer gap-1.5 text-xs font-medium">
      <Plus className="h-3.5 w-3.5" />
      <span>{t('actions.create')}</span>
    </Button>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={Truck} actions={primaryActions} />

      <SectionCard>
        <SuppliersTable />
      </SectionCard>

      <SupplierDialogs />
    </div>
  )
}

export function SuppliersFeature() {
  return (
    <SupplierProvider>
      <SupplierContent />
    </SupplierProvider>
  )
}
