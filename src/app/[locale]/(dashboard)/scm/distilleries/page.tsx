import { DistilleriesFeature } from '@/features/scm/distilleries'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Distillation Facilities',
  description: 'Official distillation facility register with extraction methods and capacity tracking'
}

export default function DistilleriesPage(): ReactElement {
  return <DistilleriesFeature />
}
