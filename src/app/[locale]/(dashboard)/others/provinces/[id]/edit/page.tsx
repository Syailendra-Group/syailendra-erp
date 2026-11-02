import { notFound } from 'next/navigation'

import { getProvinceByIdAction } from '@/actions/others/province.action'
import { ProvinceForm } from '@/features/others/provinces'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Edit Province • Syailendra ERP',
  description: 'Edit province parameters'
}

export interface EditProvincePageProps {
  params: Promise<{ id: string }>
}

export default async function EditProvincePage({ params }: EditProvincePageProps): Promise<ReactElement> {
  const { id } = await params
  if (!id) notFound()
  const province = await getProvinceByIdAction(Number(id))
  if (!province) notFound()
  return <ProvinceForm initialData={province} />
}
