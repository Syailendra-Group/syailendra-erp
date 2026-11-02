import { getFarmersAction } from '@/actions/traceability/farmer.action'
import { FarmersFeature } from '@/features/traceability/farmers'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Farmers & Plantations • Syailendra Traceability',
  description: 'Official smallholder farmers and plantations register'
}

export default async function FarmersPage(): Promise<ReactElement> {
  const { farmers } = await getFarmersAction()
  return <FarmersFeature initialData={farmers} />
}
