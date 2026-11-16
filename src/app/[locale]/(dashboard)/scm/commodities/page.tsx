import { CommoditiesFeature } from '@/features/scm/commodities'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Commodity Master • Syailendra SCM',
  description: 'Botanical commodity register, plant parts, and essential oil commodity codes'
}

export default function CommoditiesPage(): ReactElement {
  return <CommoditiesFeature />
}
