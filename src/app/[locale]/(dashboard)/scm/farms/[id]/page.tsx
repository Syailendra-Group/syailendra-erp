import { notFound } from 'next/navigation'

import { fetchFarmByIdAction } from '@/actions/scm/farm.action'
import { FarmDetail } from '@/features/scm/farms/detail'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Farm Details',
  description: 'Detailed farm block profile with terroir, cultivation practices, and location'
}

export interface FarmDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function FarmDetailPage({ params }: FarmDetailPageProps): Promise<ReactElement> {
  const { id } = await params
  const farmId = Number(id)
  if (!Number.isInteger(farmId) || farmId <= 0) notFound()

  const farm = await fetchFarmByIdAction(farmId)
  if (!farm) notFound()

  return <FarmDetail farm={farm} />
}
