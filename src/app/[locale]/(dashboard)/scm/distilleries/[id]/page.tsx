import { notFound } from 'next/navigation'

import { getDistilleryByIdAction } from '@/actions/scm/distillery.action'
import { DistilleryDetail } from '@/features/scm/distilleries/detail'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Distillation Facility Details',
  description: 'Detailed distillation facility specifications, capacity, and location'
}

export interface DistilleryDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function DistilleryDetailPage({ params }: DistilleryDetailPageProps): Promise<ReactElement> {
  const { id } = await params
  const distilleryId = Number(id)
  if (!Number.isInteger(distilleryId) || distilleryId <= 0) notFound()

  const distillery = await getDistilleryByIdAction(distilleryId)
  if (!distillery) notFound()

  return <DistilleryDetail distillery={distillery} />
}
