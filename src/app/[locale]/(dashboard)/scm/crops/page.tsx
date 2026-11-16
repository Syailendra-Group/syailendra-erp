import { CropsFeature } from '@/features/scm/crops'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Commodity Master • Syailendra SCM',
  description: 'Botanical crop register, plant parts, and essential oil commodity codes'
}

export default function CropsPage(): ReactElement {
  return <CropsFeature />
}
