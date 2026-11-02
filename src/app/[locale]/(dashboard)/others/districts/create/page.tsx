import { DistrictForm } from '@/features/others/districts'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'New District • Syailendra ERP',
  description: 'Register a new district'
}

export default function CreateDistrictPage(): ReactElement {
  return <DistrictForm />
}
