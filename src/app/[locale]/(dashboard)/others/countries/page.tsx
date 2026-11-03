import { CountriesFeature } from '@/features/others/countries'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Countries Master • Syailendra ERP',
  description: 'Official countries and international jurisdictions catalog'
}

export default function CountriesPage(): ReactElement {
  return <CountriesFeature />
}
