import { notFound } from 'next/navigation'

import { getVillageByIdAction } from '@/actions/others/village.action'
import { VillageDetail } from '@/features/others/villages'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Village Detail • Syailendra ERP',
  description: 'Village details'
}

export interface VillageDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function VillageDetailPage({ params }: VillageDetailPageProps): Promise<ReactElement> {
  const { id } = await params
  if (!id) notFound()
  const village = await getVillageByIdAction(Number(id))
  if (!village) notFound()
  return <VillageDetail village={village} />
}
