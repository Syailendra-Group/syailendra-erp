'use client'

import { FolderTree } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PrimaryAction } from '@/components/button/primary-action'
import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { SupplierTypeProvider, useSupplierTypeContext } from '@/contexts/scm/supplier-type.context'

import { SupplierTypeDialogs } from './dialogs'
import { SupplierTypesTable } from './table'

import type { ReactElement } from 'react'

function SupplierTypeContent(): ReactElement {
  const t = useTranslations('scm.supplierTypes')
  const { handleCreate } = useSupplierTypeContext()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={FolderTree}
        actions={<PrimaryAction onClick={handleCreate} label={t('actions.create')} />}
      />

      <SectionCard>
        <SupplierTypesTable />
      </SectionCard>

      <SupplierTypeDialogs />
    </div>
  )
}

export function SupplierTypesFeature(): ReactElement {
  return (
    <SupplierTypeProvider>
      <SupplierTypeContent />
    </SupplierTypeProvider>
  )
}

export * from './table'
export * from './columns'
export * from './dialogs'
export * from '@/contexts/scm/supplier-type.context'
