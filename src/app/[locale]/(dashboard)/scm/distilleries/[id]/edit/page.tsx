import { notFound } from 'next/navigation'

import { getDistilleryByIdAction } from '@/actions/scm/distillery.action'
import { DistilleryForm } from '@/features/scm/distilleries/form'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Edit Distillation Facility',
  description: 'Update distillation facility specifications, capacity, and location'
}

export interface DistilleryEditPageProps {
  params: Promise<{ id: string }>
}

export default async function DistilleryEditPage({ params }: DistilleryEditPageProps): Promise<ReactElement> {
  const { id } = await params
  const distilleryId = Number(id)
  if (!Number.isInteger(distilleryId) || distilleryId <= 0) notFound()

  const distillery = await getDistilleryByIdAction(distilleryId)
  if (!distillery) notFound()

  return <DistilleryForm initialData={distillery} />
}
