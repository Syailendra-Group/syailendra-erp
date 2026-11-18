/**
 * page.tsx — Supplier Categories Dashboard Route
 * Syailendra Group ERP (SCM Pillar)
 */

import { SupplierCategoriesFeature } from '@/features/scm/supplier-categories'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Supplier Categories',
  description: 'Hierarchical procurement grouping for raw material, packaging, and auxiliary vendors'
}

export default function SupplierCategoriesPage(): ReactElement {
  return <SupplierCategoriesFeature />
}
