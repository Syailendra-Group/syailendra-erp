import { DistrictsFeature } from '@/features/sbi/others/districts'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Districts',
  description: 'Official sub-districts and kecamatan catalog'
}

export default function DistrictsPage(): ReactElement {
  return <DistrictsFeature />
}
