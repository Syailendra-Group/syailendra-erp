import { FarmsFeature } from '@/features/scm/farms'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Farms & Terroir • Syailendra SCM',
  description: 'Farm blocks, terroir profiles, and EUDR geolocation register'
}

export default function FarmsPage(): ReactElement {
  return <FarmsFeature />
}
