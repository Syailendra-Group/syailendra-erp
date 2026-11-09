'use client'

import { FolderTree } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PrimaryAction } from '@/components/button/primary-action'
import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { SupplierCategoryProvider, useSupplierCategoryContext } from '@/contexts/scm/supplier-category.context'

import { SupplierCategoryDialogs } from './dialogs'
import { SupplierCategoriesTable } from './table'

import type { ReactElement } from 'react'

function SupplierCategoryContent(): ReactElement {
  const t = useTranslations('scm.supplierCategories')
  const { handleCreate } = useSupplierCategoryContext()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={FolderTree}
        actions={<PrimaryAction onClick={handleCreate} label={t('actions.create')} />}
      />

      <SectionCard>
        <SupplierCategoriesTable />
      </SectionCard>

      <SupplierCategoryDialogs />
    </div>
  )
}

export function SupplierCategoriesFeature(): ReactElement {
  return (
    <SupplierCategoryProvider>
      <SupplierCategoryContent />
    </SupplierCategoryProvider>
  )
}

export * from './table'
export * from './columns'
export * from './dialogs'
export * from '@/contexts/scm/supplier-category.context'
