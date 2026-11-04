import { notFound } from 'next/navigation'

import { getFarmerByIdAction } from '@/actions/scm/farmer.action'
import { FarmerDetail } from '@/features/scm/farmers'

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
  if (!id) notFound()

  const farmer = await getFarmerByIdAction(id)
  if (!farmer) notFound()

  return <FarmerDetail farmer={farmer} />
}
