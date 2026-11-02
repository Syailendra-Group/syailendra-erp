import { getDistillersAction } from '@/actions/traceability/distiller.action'
import { DistillersFeature } from '@/features/traceability/distillers'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Distiller Units • Syailendra Traceability',
  description: 'Official distillation boilers and extraction units register'
}

export default async function DistillersPage(): Promise<ReactElement> {
  const { distillers } = await getDistillersAction()
  return <DistillersFeature initialData={distillers} />
}
