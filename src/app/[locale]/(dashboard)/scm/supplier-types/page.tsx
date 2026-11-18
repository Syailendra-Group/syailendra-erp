/**
 * page.tsx — Supplier Types Dashboard Route (flat business-actor master)
 * Syailendra Group ERP (SCM Pillar)
 */

import { SupplierTypesFeature } from '@/features/scm/supplier-types'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Supplier Types',
  description: 'Flat master of supplier business-actor classifications'
}

export default function SupplierTypesPage(): ReactElement {
  return <SupplierTypesFeature />
}
