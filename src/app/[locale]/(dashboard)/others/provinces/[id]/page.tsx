import { notFound } from 'next/navigation'

import { getProvinceByIdAction } from '@/actions/others/province.action'
import { ProvinceDetail } from '@/features/others/provinces'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Province Detail • Syailendra ERP',
  description: 'Province details and jurisdiction'
}

export interface ProvinceDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProvinceDetailPage({ params }: ProvinceDetailPageProps): Promise<ReactElement> {
  const { id } = await params
  if (!id) notFound()
  const province = await getProvinceByIdAction(Number(id))
  if (!province) notFound()
  return <ProvinceDetail province={province} />
}
