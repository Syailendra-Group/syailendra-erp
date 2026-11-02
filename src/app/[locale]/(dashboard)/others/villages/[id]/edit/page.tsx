import { notFound } from 'next/navigation'

import { getVillageByIdAction } from '@/actions/others/village.action'
import { VillageForm } from '@/features/others/villages'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Edit Village • Syailendra ERP',
  description: 'Edit village details'
}

export interface EditVillagePageProps {
  params: Promise<{ id: string }>
}

export default async function EditVillagePage({ params }: EditVillagePageProps): Promise<ReactElement> {
  const { id } = await params
  if (!id) notFound()
  const village = await getVillageByIdAction(Number(id))
  if (!village) notFound()
  return <VillageForm initialData={village} />
}
