import { RegenciesFeature } from '@/features/sbi/others/regencies'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Regencies & Cities • Syailendra ERP',
  description: 'Official regencies and cities master catalog'
}

export default function RegenciesPage(): ReactElement {
  return <RegenciesFeature />
}
