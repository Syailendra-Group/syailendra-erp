import { getDistrictsAction } from '@/actions/others/district.action'
import { DistrictsFeature } from '@/features/others/districts'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Districts • Syailendra ERP',
  description: 'Official districts master catalog'
}

export default async function DistrictsPage(): Promise<ReactElement> {
  const { districts } = await getDistrictsAction()
  return <DistrictsFeature initialData={districts} />
}
