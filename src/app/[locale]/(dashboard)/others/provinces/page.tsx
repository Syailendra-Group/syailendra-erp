import { getProvincesAction } from '@/actions/others/province.action'
import { ProvincesFeature } from '@/features/others/provinces'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Provinces Master • Syailendra ERP',
  description: 'Official provinces and states catalog'
}

export default async function ProvincesPage(): Promise<ReactElement> {
  const { provinces } = await getProvincesAction()
  return <ProvincesFeature initialData={provinces} />
}
