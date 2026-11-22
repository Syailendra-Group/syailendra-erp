'use client'

import { FolderTree } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'

import { SupplierCategoriesTable } from './table'

import type { ReactElement } from 'react'

export function SupplierCategoriesFeature(): ReactElement {
  const t = useTranslations('mitra.supplierCategories')

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={FolderTree} />
      <SectionCard>
        <SupplierCategoriesTable />
      </SectionCard>
    </div>
  )
}
