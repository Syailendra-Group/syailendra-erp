import { notFound } from 'next/navigation'

import { getRegencyByIdAction } from '@/actions/others/regency.action'
import { RegencyDetail } from '@/features/others/regencies'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Regency Detail • Syailendra ERP',
  description: 'Regency and city details'
}

export interface RegencyDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function RegencyDetailPage({ params }: RegencyDetailPageProps): Promise<ReactElement> {
  const { id } = await params
  if (!id) notFound()
  const regency = await getRegencyByIdAction(Number(id))
  if (!regency) notFound()
  return <RegencyDetail regency={regency} />
}
