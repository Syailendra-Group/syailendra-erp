import { notFound } from 'next/navigation'

import { fetchSupplierByIdAction } from '@/actions/scm/supplier.action'
import { SupplierDetail } from '@/features/scm/suppliers/detail'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Supplier Details',
  description: 'Detailed supplier profile, classification, legality, contact, banking, and address'
}

export interface SupplierDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function SupplierDetailPage({ params }: SupplierDetailPageProps): Promise<ReactElement> {
  const { id } = await params
  const supplierId = Number(id)
  if (!Number.isInteger(supplierId) || supplierId <= 0) notFound()

  const supplier = await fetchSupplierByIdAction(supplierId)
  if (!supplier) notFound()

  return <SupplierDetail supplier={supplier} />
}
