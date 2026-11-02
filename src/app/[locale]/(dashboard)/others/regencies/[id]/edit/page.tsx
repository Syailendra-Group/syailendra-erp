import { notFound } from 'next/navigation'

import { getRegencyByIdAction } from '@/actions/others/regency.action'
import { RegencyForm } from '@/features/others/regencies'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Edit Regency/City • Syailendra ERP',
  description: 'Edit regency details'
}

export interface EditRegencyPageProps {
  params: Promise<{ id: string }>
}

export default async function EditRegencyPage({ params }: EditRegencyPageProps): Promise<ReactElement> {
  const { id } = await params
  if (!id) notFound()
  const regency = await getRegencyByIdAction(Number(id))
  if (!regency) notFound()
  return <RegencyForm initialData={regency} />
}
