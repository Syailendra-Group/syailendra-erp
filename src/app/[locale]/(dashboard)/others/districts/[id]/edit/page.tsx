import { notFound } from 'next/navigation'

import { getDistrictByIdAction } from '@/actions/others/district.action'
import { DistrictForm } from '@/features/others/districts'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Edit District • Syailendra ERP',
  description: 'Edit district details'
}

export interface EditDistrictPageProps {
  params: Promise<{ id: string }>
}

export default async function EditDistrictPage({ params }: EditDistrictPageProps): Promise<ReactElement> {
  const { id } = await params
  if (!id) notFound()
  const district = await getDistrictByIdAction(Number(id))
  if (!district) notFound()
  return <DistrictForm initialData={district} />
}
