import { notFound } from 'next/navigation'

import { getDistrictByIdAction } from '@/actions/others/district.action'
import { DistrictDetail } from '@/features/others/districts'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'District Detail • Syailendra ERP',
  description: 'District details'
}

export interface DistrictDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function DistrictDetailPage({ params }: DistrictDetailPageProps): Promise<ReactElement> {
  const { id } = await params
  if (!id) notFound()
  const district = await getDistrictByIdAction(Number(id))
  if (!district) notFound()
  return <DistrictDetail district={district} />
}
