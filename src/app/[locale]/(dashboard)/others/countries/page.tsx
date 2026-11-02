import { getCountriesAction } from '@/actions/others/country.action'
import { CountriesFeature } from '@/features/others/countries'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Countries Master • Syailendra ERP',
  description: 'Official countries master catalog'
}

export default async function CountriesPage(): Promise<ReactElement> {
  const { countries } = await getCountriesAction()
  return <CountriesFeature initialData={countries} />
}
