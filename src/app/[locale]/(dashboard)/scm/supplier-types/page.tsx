/**
 * page.tsx — Supplier Types Dashboard Route
 * Syailendra Group ERP (SCM Pillar)
 */

import { SupplierTypesFeature } from '@/features/scm/supplier-types'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Supplier Types',
  description: 'Hierarchical supplier type classification for raw material, packaging, and auxiliary vendors'
}

export default function SupplierTypesPage(): ReactElement {
  return <SupplierTypesFeature />
}
