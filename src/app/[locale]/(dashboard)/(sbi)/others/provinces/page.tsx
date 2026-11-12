import { ProvincesFeature } from '@/features/sbi/others/provinces'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Provinces Master • Syailendra ERP',
  description: 'Official provinces and states catalog'
}

export default function ProvincesPage(): ReactElement {
  return <ProvincesFeature />
}
