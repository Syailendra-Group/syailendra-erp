/**
 * page.tsx — Supplier Categories route (Mitra pillar)
 * Syailendra Group ERP
 */

import { SupplierCategoriesFeature } from '@/features/mitra/supplier-categories'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Supplier Categories',
  description: 'Hierarchical supplier categories for procurement grouping'
}

export default function SupplierCategoriesPage(): ReactElement {
  return <SupplierCategoriesFeature />
}
