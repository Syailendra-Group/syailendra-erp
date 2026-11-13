'use client'

import { Truck } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PrimaryAction } from '@/components/button/primary-action'
import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { SupplierProvider, useSupplierContext } from '@/contexts/scm/supplier.context'

import { SupplierDialogs } from './dialogs'
import { SuppliersTable } from './table'

import type { ReactElement } from 'react'

function SupplierContent(): ReactElement {
  const t = useTranslations('scm.suppliers')
  const { handleCreate } = useSupplierContext()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Truck}
        actions={<PrimaryAction onClick={handleCreate} label={t('actions.create')} />}
      />

      <SectionCard>
        <SuppliersTable />
      </SectionCard>

      <SupplierDialogs />
    </div>
  )
}

export function SuppliersFeature(): ReactElement {
  return (
    <SupplierProvider>
      <SupplierContent />
    </SupplierProvider>
  )
}

export * from './table'
export * from './columns'
export * from './dialogs'
export * from '@/contexts/scm/supplier.context'
