/**
 * feature.tsx — Container component for Supplier Categories feature
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { FolderTree, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'

import { SupplierCategoryDialogs } from './dialogs'
import { SupplierCategoryFormDialog } from './form'
import { SupplierCategoryProvider, useSupplierCategoryContext } from './supplier-category.context'
import { SupplierCategoriesTable } from './table'

function SupplierCategoryContent() {
  const t = useTranslations('scm.supplierCategories')
  const { setOpen, setSelectedCategory } = useSupplierCategoryContext()

  const handleCreate = () => {
    setSelectedCategory(null)
    setOpen('create')
  }

  const primaryActions = (
    <Button size="sm" onClick={handleCreate} className="h-8 gap-1.5 text-xs">
      <Plus className="h-3.5 w-3.5" />
      <span>{t('actions.create')}</span>
    </Button>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={FolderTree} actions={primaryActions} />

      <SectionCard>
        <SupplierCategoriesTable />
      </SectionCard>

      <SupplierCategoryFormDialog />
      <SupplierCategoryDialogs />
    </div>
  )
}

export function SupplierCategoriesFeature() {
  return (
    <SupplierCategoryProvider>
      <SupplierCategoryContent />
    </SupplierCategoryProvider>
  )
}
