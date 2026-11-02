import { getRegenciesAction } from '@/actions/others/regency.action'
import { RegenciesFeature } from '@/features/others/regencies'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Regencies & Cities • Syailendra ERP',
  description: 'Official regencies and cities master catalog'
}

export default async function RegenciesPage(): Promise<ReactElement> {
  const { regencies } = await getRegenciesAction()
  return <RegenciesFeature initialData={regencies} />
}
