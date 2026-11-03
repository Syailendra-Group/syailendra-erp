import { VillagesFeature } from '@/features/others/villages'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Villages & Plantations • Syailendra ERP',
  description: 'Official villages master catalog'
}

export default function VillagesPage(): ReactElement {
  return <VillagesFeature />
}
