import { notFound } from 'next/navigation'

import { getFarmerByIdAction } from '@/actions/scm/farmer.action'
import { FarmerForm } from '@/features/scm/farmers'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Edit Farmer',
  description: 'Update partner farmer profile and plantation data'
}

export interface EditFarmerPageProps {
  params: Promise<{ id: string }>
}

export default async function EditFarmerPage({ params }: EditFarmerPageProps): Promise<ReactElement> {
  const { id } = await params
  if (!id) notFound()

  const farmer = await getFarmerByIdAction(id)
  if (!farmer) notFound()

  return <FarmerForm initialData={farmer} />
}
