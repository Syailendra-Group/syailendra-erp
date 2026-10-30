import { notFound } from 'next/navigation'

import { FarmerDetail } from '@/features/traceability/farmers'
import { getFarmerByIdAction } from '@/features/traceability/farmers/actions'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Farmer Details • Syailendra Traceability',
  description: 'Detailed profile, terroir location, and crop traceability of smallholder farmer'
}

export interface FarmerDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function FarmerDetailPage({ params }: FarmerDetailPageProps): Promise<ReactElement> {
  const { id } = await params
  const farmerId = parseInt(id, 10)
  if (isNaN(farmerId)) notFound()

  const farmer = await getFarmerByIdAction(farmerId)
  if (!farmer) notFound()

  return <FarmerDetail farmer={farmer} />
}
