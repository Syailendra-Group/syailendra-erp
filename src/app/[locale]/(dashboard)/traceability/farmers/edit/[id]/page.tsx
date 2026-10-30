import { notFound } from 'next/navigation'

import { FarmerForm } from '@/features/traceability/farmers'
import { getFarmerByIdAction } from '@/features/traceability/farmers/actions'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Edit Farmer • Syailendra Traceability',
  description: 'Update partner farmer profile and plantation data'
}

export interface EditFarmerPageProps {
  params: Promise<{ id: string }>
}

export default async function EditFarmerPage({ params }: EditFarmerPageProps): Promise<ReactElement> {
  const { id } = await params
  const farmerId = parseInt(id, 10)
  if (isNaN(farmerId)) notFound()

  const farmer = await getFarmerByIdAction(farmerId)
  if (!farmer) notFound()

  return <FarmerForm initialData={farmer} />
}
